import { supabaseAdmin } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { WalletConnect } from "@/components/wallet-connect";
import { AdminGuard } from "@/components/admin/admin-guard";

export const dynamic = 'force-dynamic';

export default async function AdminMigrationsPage() {
  const { data: snapshots, error } = await supabaseAdmin
    .from('token_snapshots')
    .select(`
      id,
      holder_count,
      new_token_name,
      old_token_name,
      created_at,
      tokens (
        coin_type
      )
    `)
    .order('created_at', { ascending: false });

  const { count: tokensCount, error: tokensError } = await supabaseAdmin
    .from('tokens')
    .select('*', { count: 'exact', head: true });

  if (error || tokensError) {
    console.error('Error fetching snapshots:', error);
    console.error('Error fetching tokens:', tokensError);
    return (
      <div className="p-4 text-red-500">
        <h3 className="font-bold">Error Loading Data</h3>
        <pre>{JSON.stringify(error || tokensError, null, 2)}</pre>
      </div>
    );
  }

  console.log('Raw Snapshots Data:', snapshots);
  console.log('Snapshots Error:', error);

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-10">
        <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-20">
          <div className="container max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                    M
                  </div>
                  <span className="font-bold text-lg tracking-tight text-white">sui-migrate</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Admin</span>
                </div>
              </Link>
            </div>
            <WalletConnect />
          </div>
        </header>

        <main className="container max-w-6xl mx-auto px-4 py-12">
          <AdminGuard>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Migration Snapshots
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage and view your token migration snapshots.
                    <span className="text-xs ml-2 opacity-50">
                      (Snapshots: {snapshots?.length || 0}, Tokens: {tokensCount || 0})
                    </span>
                  </p>
                </div>
                <Link href="/admin/migrations/create">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Migration
                  </Button>
                </Link>
              </div>

              <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-0">
                  <div className="rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="font-semibold text-gray-300">Original Coin Type</TableHead>
                          <TableHead className="font-semibold text-gray-300">New Token Name</TableHead>
                          <TableHead className="font-semibold text-gray-300">Holders</TableHead>
                          <TableHead className="font-semibold text-gray-300">Created At</TableHead>
                          <TableHead className="font-semibold text-gray-300">Snapshot ID</TableHead>
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
                            </TableRow>
                          );
                        })}
                        {(!snapshots || snapshots.length === 0) && (
                          <TableRow className="border-white/10">
                            <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
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
                </CardContent>
              </Card>
            </div>
          </AdminGuard>
        </main>
      </div>
    </>
  );
}
