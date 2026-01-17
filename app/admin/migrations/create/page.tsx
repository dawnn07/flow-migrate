import { SnapshotForm } from "@/components/snapshot-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";

export default function CreateMigrationPage() {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-10">
        <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-20">
          <div className="container max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/migrations">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Migrations
                </Button>
              </Link>
            </div>
            <WalletConnect />
          </div>
        </header>

        <main className="container max-w-2xl mx-auto px-4 py-12">
          <AdminGuard>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Create New Migration
              </h1>
              <p className="text-muted-foreground">
                Take a snapshot of token holders to start a migration.
              </p>
            </div>

            <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-6">
                <SnapshotForm />
              </CardContent>
            </Card>
          </AdminGuard>
        </main>
      </div>
    </>
  );
}
