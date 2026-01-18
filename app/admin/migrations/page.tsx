import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { WalletConnect } from "@/components/wallet-connect";
import { AdminGuard } from "@/components/admin/admin-guard";
import { MigrationsTable } from "@/components/admin/migrations-table";

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
                  <MigrationsTable snapshots={snapshots || []} />
                </CardContent>
              </Card>
            </div>
          </AdminGuard>
        </main>
      </div>
    </>
  );
}
