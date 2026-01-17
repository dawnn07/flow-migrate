import { MigrationCard } from "@/components/migration-card";
import { WalletConnect } from "@/components/wallet-connect";
import { AnimatedBackground } from "@/components/animated-background";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MigratePage({ params }: { params: { id: string } }) {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-20">
          <div className="container max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold">
                  M
                </div>
                <span className="font-bold text-lg tracking-tight">sui-migrate</span>
              </div>
            </div>
            <WalletConnect />
          </div>
        </header>

        {/* Main Content */}
        <main className="container max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Token Migration Alpha</h1>
            <p className="text-muted-foreground">
              Migrate your OLD tokens to receive MFT
            </p>
          </div>

          <MigrationCard />
        </main>
      </div>
    </>
  );
}
