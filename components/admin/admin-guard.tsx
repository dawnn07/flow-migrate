"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { ADMIN_WALLET_ADDRESS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glassmorphism border-violet-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Wallet Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please connect your wallet to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (account.address !== ADMIN_WALLET_ADDRESS) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glassmorphism border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              You do not have permission to access this page.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Connected: {account.address.slice(0, 10)}...{account.address.slice(-8)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
