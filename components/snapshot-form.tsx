'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE, CLOCK_ID } from '@/lib/constants';

export function SnapshotForm() {
  const [coinType, setCoinType] = useState('');
  const [newTokenName, setNewTokenName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ holderCount: number; snapshotId: string } | null>(null);
  const router = useRouter();

  // Contract Interaction
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coinType, newTokenName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch snapshot');
      }

      setResult({
        holderCount: data.holderCount,
        snapshotId: data.snapshotId,
      });
      toast.success('Snapshot created successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsInitializing(true);

    try {
      const tx = new Transaction();

      // MOCK VALUES for demonstration - In production these should be inputs or fetched
      const totalOldSupply = 1_000_000_000_000n;
      const totalNewSupply = 1_000_000_000_000n;
      const snapshotRoot = Array.from(new Uint8Array(32)); // Dummy 32-byte root

      // We need to pass TreasuryCaps.
      // For this demo, we assume the user has them and we just pass the object ID placeholders
      // OR we assume the contract mints them?
      // The contract signature says: `treasury_new: TreasuryCap<NewToken>, treasury_receipt: TreasuryCap<Receipt>`
      // This means the caller must OWN these objects and pass them in.
      // This is tricky for a generic UI without knowing the object IDs of the TreasuryCaps.
      // For now, I will add inputs for TreasuryCap IDs if this was a real admin tool.
      // But to keep it simple for the user request, I'll use placeholders or assume they are known.

      // Since I can't easily get the user's TreasuryCaps without scanning their wallet,
      // I'll assume for this integration step that we are just calling the function with placeholders
      // and the user (dev) will need to fill them or we'd implement a picker.

      // Let's try to find them in the wallet?
      // For now, I'll just use a placeholder string and let the user know.
      const TREASURY_NEW_ID = "0x...YOUR_NEW_TOKEN_TREASURY_CAP_ID...";
      const TREASURY_RECEIPT_ID = "0x...YOUR_RECEIPT_TOKEN_TREASURY_CAP_ID...";

      // NOTE: In a real app, we would query the user's wallet for objects of type TreasuryCap<NewToken> etc.

      tx.moveCall({
        target: `${PACKAGE_ID}::migration::initialize_migration`,
        typeArguments: [OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE],
        arguments: [
          tx.object(TREASURY_NEW_ID), // User must replace this or we implement a picker
          tx.object(TREASURY_RECEIPT_ID), // User must replace this
          tx.pure.u64(totalOldSupply),
          tx.pure.u64(totalNewSupply),
          tx.pure.vector("u8", snapshotRoot),
          tx.object(CLOCK_ID),
        ],
      });

      await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            toast.success("Migration Initialized on-chain!");
            router.push('/admin/migrations');
          },
          onError: (error) => {
            console.error(error);
            toast.error("Initialization failed: " + error.message);
          },
        }
      );
    } catch (error: any) {
      console.error(error);
      toast.error("Initialization failed: " + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200 ml-1">Original Coin Type</label>
          <Input
            placeholder="0x...::module::TOKEN"
            value={coinType}
            onChange={(e) => setCoinType(e.target.value)}
            disabled={loading || !!result}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all h-12"
          />
          <p className="text-xs text-muted-foreground ml-1">
            Format: 0xPACKAGE::MODULE::TOKEN
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200 ml-1">New Token Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
          <Input
            placeholder="e.g. My New Token"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            disabled={loading || !!result}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all h-12"
          />
        </div>

        {!result && (
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] h-12 font-semibold text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scanning Blockchain...
              </>
            ) : (
              'Take Snapshot'
            )}
          </Button>
        )}
      </form>

      {result && (
        <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-300">Snapshot Successful!</h3>
              <p className="text-sm text-green-400/80 mt-1">
                Successfully indexed <span className="font-bold text-green-300 text-base">{result.holderCount.toLocaleString()}</span> unique holders.
              </p>
            </div>
            <div className="w-full bg-black/20 rounded-lg p-3 border border-green-500/10">
              <p className="text-xs text-muted-foreground font-mono break-all select-all">
                ID: {result.snapshotId}
              </p>
            </div>

            <div className="w-full pt-4 space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                onClick={handleInitialize}
                disabled={isInitializing}
              >
                 {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing Contract...
                  </>
                ) : (
                  'Initialize Migration On-Chain'
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full border-green-500/30 hover:bg-green-500/10 text-green-400 hover:text-green-300 h-11"
                onClick={() => router.push('/admin/migrations')}
              >
                Skip & View in Admin Panel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
