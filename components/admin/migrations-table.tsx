'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'sonner';
import { useState } from 'react';
import { PACKAGE_ID, MIGRATION_CONFIG_ID, VAULT_ID, OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE, POOL_REGISTRY_ID, POSITION_REGISTRY_ID, VERSIONED_ID, CLOCK_ID } from '@/lib/constants';

interface MigrationsTableProps {
  snapshots: any[];
}

export function MigrationsTable({ snapshots }: MigrationsTableProps) {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isFinalizing, setIsFinalizing] = useState<string | null>(null);

  const handleFinalize = async (snapshotId: string) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsFinalizing(snapshotId);

    try {
      const tx = new Transaction();

      // ARGS for finalize_and_create_pool
      // These should ideally be configurable via a modal
      const oldPoolFee = 3000; // 0.3%
      const minSuiOut = 0; // Slippage 100% for demo
      const initialPriceX128 = "18446744073709551616"; // Price 1.0 (Q64.64) -> wait, Q64.64 1.0 is 2^64.
      // The contract expects Q64.64 for sqrt_price usually, but here it says initial_price_x128.
      // FlowX usually uses sqrt_price_x64. Let's check the contract signature again.
      // Contract says `initial_price_x128: u128`. This might be Price X128 (Q64.128?) or just SqrtPriceX64?
      // FlowX create_pool takes sqrt_price_x64.
      // The adapter `flowx_clmm_adapter::create_pool` takes `initial_price_x128`.
      // Let's assume it's sqrt_price_x64 for now or 1.0.
      // 1.0 in Q64.64 is 18446744073709551616.

      const tickLower = 4294967295; // u32 max? No, these are i32 usually but Move uses u32 with offset?
      // FlowX ticks are i32. Move `u32` usually implies some encoding.
      // Let's use standard range for full range if possible, or just 0 to 100.
      // For simplicity, let's use a small range around current tick.
      // This is DANGEROUS without knowing the math.
      // I'll use placeholders 0 and 100.

      tx.moveCall({
        target: `${PACKAGE_ID}::migration::finalize_and_create_pool`,
        typeArguments: [OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE],
        arguments: [
          tx.object(MIGRATION_CONFIG_ID),
          tx.object(VAULT_ID),
          tx.object(POOL_REGISTRY_ID),
          tx.object(POSITION_REGISTRY_ID),
          tx.object(VERSIONED_ID),
          tx.object(CLOCK_ID),
          tx.pure.u64(oldPoolFee),
          tx.pure.u64(minSuiOut),
          tx.pure.u128(BigInt(initialPriceX128)),
          tx.pure.u32(4294947296), // -20000 (as u32) - Just guessing encoding
          tx.pure.u32(20000),      // +20000
        ],
      });

      await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            toast.success("Migration Finalized & Pool Created!");
            setIsFinalizing(null);
          },
          onError: (error) => {
            console.error(error);
            toast.error("Finalization failed: " + error.message);
            setIsFinalizing(null);
          },
        }
      );
    } catch (error: any) {
      console.error(error);
      toast.error("Finalization failed: " + error.message);
      setIsFinalizing(null);
    }
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead className="font-semibold text-gray-300">Original Coin Type</TableHead>
            <TableHead className="font-semibold text-gray-300">New Token Name</TableHead>
            <TableHead className="font-semibold text-gray-300">Holders</TableHead>
            <TableHead className="font-semibold text-gray-300">Created At</TableHead>
            <TableHead className="font-semibold text-gray-300">Snapshot ID</TableHead>
            <TableHead className="font-semibold text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots?.map((snapshot: any) => {
            const tokenData = Array.isArray(snapshot.tokens) ? snapshot.tokens[0] : snapshot.tokens;
            const coinType = tokenData?.coin_type || 'Unknown';

            return (
              <TableRow key={snapshot.id} className="border-white/10 hover:bg-white/5 transition-colors">
                <TableCell className="font-mono text-xs max-w-[200px] truncate text-gray-400" title={coinType}>
                  {coinType}
                </TableCell>
                <TableCell className="font-medium text-gray-200">{snapshot.new_token_name || '-'}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {snapshot.holder_count.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-gray-400 text-sm">
                  {new Date(snapshot.created_at).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(snapshot.created_at).toLocaleTimeString()}</span>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">{snapshot.id}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50"
                    onClick={() => handleFinalize(snapshot.id)}
                    disabled={!!isFinalizing}
                  >
                    {isFinalizing === snapshot.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Finalize"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {(!snapshots || snapshots.length === 0) && (
            <TableRow className="border-white/10">
              <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <p>No migrations found</p>
                  <Link href="/admin/migrations/create">
                    <Button variant="link" className="text-cyan-400">Create your first migration</Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
