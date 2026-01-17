import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const SUI_GRAPHQL_URL = 'https://graphql.testnet.sui.io/graphql';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { coinType, newTokenName } = body;
    let oldTokenName = ''

    // 1. Validate coinType
    if (!coinType || typeof coinType !== 'string' || !coinType.match(/^0x[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/)) {
      return NextResponse.json({ error: 'Invalid coinType format. Expected 0xPACKAGE::MODULE::TOKEN' }, { status: 400 });
    }

    // 2. Upsert token into `tokens` table (Required for Foreign Key)
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('tokens')
      .upsert({ coin_type: coinType }, { onConflict: 'coin_type' })
      .select('id')
      .single();

    if (tokenError) {
      console.error('Error upserting token:', tokenError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const tokenId = tokenData.id;

    // 3. Fetch ALL Coin<T> objects via Sui Indexer GraphQL
    const holdersMap = new Map<string, number>(); // address -> balance
    let cursor: string | null = null;
    let hasNextPage = true;
    let pageCount = 0;
    const MAX_PAGES = 2000; // Safety limit

    // Updated Query to handle Owner Polymorphism correctly
    const query = `
      query ($type: String!, $cursor: String, $coinType: String!) {
        coinMetadata(coinType: $coinType) {
          name
          symbol
          decimals
        }
        objects(filter: { type: $type }, first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            owner {
              __typename
              ... on AddressOwner {
                address {
                  address
                }
              }
              ... on ObjectOwner {
                address {
                  address
                }
              }
            }
            asMoveObject {
              contents {
                json
              }
            }
          }
        }
      }
    `;

    while (hasNextPage && pageCount < MAX_PAGES) {
      const response = await fetch(SUI_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            type: `0x2::coin::Coin<${coinType}>`,
            coinType: coinType,
            cursor,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sui GraphQL error:', response.status, errorText);
        throw new Error(`Sui GraphQL error: ${response.status}`);
      }

      const result = await response.json();

      console.log('GraphQL Response:', result);

      if (result.errors) {
        console.error('GraphQL Query Errors:', result.errors);
        throw new Error('GraphQL Query Error');
      }

      const data = result.data?.objects;
      oldTokenName = result.data?.coinMetadata?.name;


      console.log('GraphQL Data:', data);
      if (!data) {
         break;
      }

      const nodes = data.nodes || [];
      for (const node of nodes) {
        // Parse owner address from nested structure
        // Structure: owner: { address: { address: "0x..." } }
        let ownerAddress = '';

        if (node.owner && node.owner.address && node.owner.address.address) {
            ownerAddress = node.owner.address.address;
        }

        if (!ownerAddress || ownerAddress === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            continue;
        }

        const content = node.asMoveObject?.contents?.json;
        // Coin<T> struct has `balance` field
        if (content && 'balance' in content) {
            const balance = parseFloat(content.balance);
            if (balance > 0) {
                const currentBalance = holdersMap.get(ownerAddress) || 0;
                holdersMap.set(ownerAddress, currentBalance + balance);
            }
        }
      }

      hasNextPage = data.pageInfo.hasNextPage;
      cursor = data.pageInfo.endCursor;
      pageCount++;
    }

    const uniqueHolderCount = holdersMap.size;


    // 4. Create snapshot row
    const { data: snapshotData, error: snapshotError } = await supabaseAdmin
      .from('token_snapshots')
      .insert({
        token_id: tokenId,
        holder_count: uniqueHolderCount,
        new_token_name: newTokenName || null,
        old_token_name: oldTokenName || null,
      })
      .select('id')
      .single();

    if (snapshotError) {
      console.error('Error creating snapshot:', snapshotError);
      return NextResponse.json({ error: 'Database error saving snapshot' }, { status: 500 });
    }

    const snapshotId = snapshotData.id;

    // 5. Store holder balances in token_holders
    const holderEntries = Array.from(holdersMap.entries()).map(([owner, balance]) => ({
      snapshot_id: snapshotId,
      owner_address: owner,
      balance: balance,
    }));

    if (holderEntries.length > 0) {
        const BATCH_SIZE = 1000;
        for (let i = 0; i < holderEntries.length; i += BATCH_SIZE) {
            const batch = holderEntries.slice(i, i + BATCH_SIZE);
            const { error: holdersError } = await supabaseAdmin
                .from('token_holders')
                .insert(batch);

            if (holdersError) {
                console.error('Error saving holders batch:', holdersError);
            }
        }
    }

    return NextResponse.json({
      coinType,
      holderCount: uniqueHolderCount,
      snapshotId,
    });

  } catch (error: any) {
    console.error('Snapshot API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
