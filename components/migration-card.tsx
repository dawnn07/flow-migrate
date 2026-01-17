"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TokenInput } from "@/components/token-input";
import { Countdown } from "@/components/countdown";
import { ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MigrationCard() {
  const account = useCurrentAccount();
  const [amount, setAmount] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const userBalance = "10,000";
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const handleMax = () => {
    setAmount(userBalance.replace(/,/g, ""));
  };

  const handleMigrate = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms of service");
      return;
    }

    setIsLoading(true);

    try {
      // Mock transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Migration successful!");
      setAmount("");
      setTermsAccepted(false);
    } catch (error) {
      toast.error("Migration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedReceive = amount ? parseFloat(amount).toFixed(2) : "0.00";
  const canMigrate = account && amount && parseFloat(amount) > 0 && termsAccepted;

  return (
    <Card className="glassmorphism border-cyan-500/20 max-w-lg mx-auto">
      <CardHeader>
        <Countdown endDate={endDate} />
        <CardTitle className="text-2xl text-center">Token Migration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* You Send */}
        <TokenInput
          label="You Send"
          value={amount}
          onChange={setAmount}
          tokenSymbol="OLD"
          balance={userBalance}
          onMax={handleMax}
        />

        {/* Arrow Divider */}
        <div className="flex justify-center">
          <div className="bg-secondary rounded-full p-2">
            <ArrowDown className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        {/* You Receive */}
        <TokenInput
          label="You Receive"
          value={estimatedReceive}
          tokenSymbol="MFT"
          readOnly
        />

        {/* Terms Checkbox */}
        <div className="flex items-center space-x-2 p-4 bg-secondary/50 rounded-lg">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I accept the{" "}
            <a href="#" className="text-cyan-400 hover:text-cyan-300 underline">
              Terms of Service
            </a>
          </label>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full h-12 text-lg font-semibold glow-cyan bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleMigrate}
          disabled={!canMigrate || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Migrating...
            </>
          ) : !account ? (
            "Connect Wallet"
          ) : !amount || parseFloat(amount) <= 0 ? (
            "Enter an amount"
          ) : (
            "Migrate"
          )}
        </Button>

        {/* Wallet Summary */}
        {account && (
          <div className="pt-4 border-t border-border text-center text-sm text-muted-foreground">
            <p>Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
