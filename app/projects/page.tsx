import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/animated-background";
import { WalletConnect } from "@/components/wallet-connect";
import Link from "next/link";
import { Users, Calendar, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
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

  if (error) {
    console.error('Error fetching snapshots:', error);
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading projects. Please try again later.
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
                </div>
              </Link>
            </div>
            <WalletConnect />
          </div>
        </header>

        <main className="container max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col gap-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Active Migrations
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore ongoing token migrations on the Sui network. Join the community and migrate your tokens seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snapshots?.map((snapshot: any) => {
                const tokenData = Array.isArray(snapshot.tokens) ? snapshot.tokens[0] : snapshot.tokens;
                const coinType = tokenData?.coin_type || 'Unknown';
                const shortCoinType = coinType.length > 20 ? `${coinType.slice(0, 10)}...${coinType.slice(-8)}` : coinType;

                return (
                  <Card key={snapshot.id} className="border-white/10 bg-black/40 backdrop-blur-xl hover:bg-white/5 transition-all duration-300 group overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 truncate max-w-[200px]" title={coinType}>
                          {shortCoinType}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(snapshot.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {snapshot.old_token_name || 'Unknown Token'}
                        <span className="text-muted-foreground mx-2">→</span>
                        {snapshot.new_token_name || 'New Token'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">{snapshot.holder_count.toLocaleString()} Holders</span>
                        </div>
                        <Link href={`/migrate/${snapshot.id}`}>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(!snapshots || snapshots.length === 0) && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-muted-foreground text-lg">No active migrations found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
