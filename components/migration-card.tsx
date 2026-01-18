"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TokenInput } from "@/components/token-input";
import { Countdown } from "@/components/countdown";
import { ArrowDown, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PACKAGE_ID, MIGRATION_CONFIG_ID, VAULT_ID, OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE } from "@/lib/constants";

export function MigrationCard() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [amount, setAmount] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [rawBalance, setRawBalance] = useState(0n);

  // State to track if migration is finalized (Claim Phase)
  // In a real app, fetch this from the contract (MigrationConfig.finalized)
  const [isFinalized, setIsFinalized] = useState(false);
  const [receiptBalance, setReceiptBalance] = useState("0");
  const [rawReceiptBalance, setRawReceiptBalance] = useState(0n);

  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  useEffect(() => {
    async function fetchData() {
      if (!account) return;

      try {
        // Fetch Old Token Balance
        const { totalBalance: oldBal } = await client.getBalance({
          owner: account.address,
          coinType: OLD_TOKEN_TYPE,
        });
        const oldBalBigInt = BigInt(oldBal);
        setRawBalance(oldBalBigInt);
        setBalance((Number(oldBalBigInt) / 1_000_000_000).toLocaleString());

        // Fetch Receipt Token Balance (for Claim phase)
        const { totalBalance: receiptBal } = await client.getBalance({
          owner: account.address,
          coinType: RECEIPT_TOKEN_TYPE,
        });
        const receiptBalBigInt = BigInt(receiptBal);
        setRawReceiptBalance(receiptBalBigInt);
        setReceiptBalance((Number(receiptBalBigInt) / 1_000_000_000).toLocaleString());

        // Auto-fill amount based on current mode
        if (isFinalized) {
            setAmount((Number(receiptBalBigInt) / 1_000_000_000).toString());
        } else {
            setAmount((Number(oldBalBigInt) / 1_000_000_000).toString());
        }

        // TODO: Fetch MigrationConfig to check if finalized
        // const config = await client.getObject({ id: MIGRATION_CONFIG_ID, options: { showContent: true } });
        // setIsFinalized(config.data?.content?.fields?.finalized);

      } catch (error) {
        console.error("Failed to fetch balances", error);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [account, client, isFinalized]);

  // Effect to update amount when mode changes or balances load
  useEffect(() => {
      if (isFinalized) {
          setAmount((Number(rawReceiptBalance) / 1_000_000_000).toString());
      } else {
          setAmount((Number(rawBalance) / 1_000_000_000).toString());
      }
  }, [isFinalized, rawBalance, rawReceiptBalance]);



  const handleAction = async () => {
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
      const tx = new Transaction();
      // Use raw balance directly for "Migrate All" to avoid precision issues
      const amountBigInt = isFinalized ? rawReceiptBalance : rawBalance;

      if (isFinalized) {
        // --- CLAIM FLOW ---
        const { data: coins } = await client.getCoins({
            owner: account.address,
            coinType: RECEIPT_TOKEN_TYPE,
        });

        if (coins.length === 0) throw new Error("No Receipt tokens found");

        const primaryCoin = coins[0];
        if (BigInt(primaryCoin.balance) < amountBigInt) {
             if (coins.length > 1) {
                 tx.mergeCoins(tx.object(primaryCoin.coinObjectId), coins.slice(1).map(c => tx.object(c.coinObjectId)));
             }
        }
        const [coinToBurn] = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [amountBigInt]);

        tx.moveCall({
            target: `${PACKAGE_ID}::migration::claim`,
            typeArguments: [OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE],
            arguments: [
                tx.object(MIGRATION_CONFIG_ID),
                coinToBurn
            ]
        });

      } else {
        // --- MIGRATE FLOW ---
        const { data: coins } = await client.getCoins({
            owner: account.address,
            coinType: OLD_TOKEN_TYPE,
        });

        if (coins.length === 0) throw new Error("No OLD tokens found");

        const primaryCoin = coins[0];
        if (BigInt(primaryCoin.balance) < amountBigInt) {
             if (coins.length > 1) {
                 tx.mergeCoins(tx.object(primaryCoin.coinObjectId), coins.slice(1).map(c => tx.object(c.coinObjectId)));
             }
        }

        const [coinToTransfer] = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [amountBigInt]);

        // Dummy proof and quota for now
        const snapshotQuota = 1_000_000_000_000n;
        const proof: string[] = [];

        tx.moveCall({
            target: `${PACKAGE_ID}::migration::migrate`,
            typeArguments: [OLD_TOKEN_TYPE, NEW_TOKEN_TYPE, RECEIPT_TOKEN_TYPE],
            arguments: [
            tx.object(MIGRATION_CONFIG_ID),
            tx.object(VAULT_ID),
            coinToTransfer,
            tx.pure.u64(snapshotQuota),
            tx.pure.vector("vector<u8>", []),
            ],
        });
      }

      await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            toast.success(isFinalized ? "Claim successful!" : "Migration successful!");
            setAmount("");
            setTermsAccepted(false);
          },
          onError: (error) => {
            console.error(error);
            toast.error("Transaction failed: " + error.message);
          },
        }
      );
    } catch (error: any) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedReceive = amount ? parseFloat(amount).toFixed(2) : "0.00";
  const canAct = account && amount && parseFloat(amount) > 0 && termsAccepted;

  return (
    <Card className="glassmorphism border-cyan-500/20 max-w-lg mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
             <div className="text-sm text-muted-foreground">Status:</div>
             <div className={`text-sm font-bold ${isFinalized ? "text-green-400" : "text-cyan-400"}`}>
                 {isFinalized ? "Finalized (Claiming Open)" : "Migration Active"}
             </div>
        </div>
        {!isFinalized && <Countdown endDate={endDate} />}
        <CardTitle className="text-2xl text-center">
            {isFinalized ? "Claim New Tokens" : "Migrate Tokens"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Token */}
        <TokenInput
          label={isFinalized ? "Burn Receipt" : "You Send"}
          value={amount}
          onChange={() => {}} // No-op, read-only
          tokenSymbol={isFinalized ? "MFT" : "OLD"}
          balance={isFinalized ? receiptBalance : balance}
          readOnly={true} // Make it read-only
        />

        {/* Arrow Divider */}
        <div className="flex justify-center">
          <div className="bg-secondary rounded-full p-2">
            {isFinalized ? <ArrowRight className="h-5 w-5 text-green-400" /> : <ArrowDown className="h-5 w-5 text-cyan-400" />}
          </div>
        </div>

        {/* Output Token */}
        <TokenInput
          label="You Receive"
          value={estimatedReceive}
          tokenSymbol={isFinalized ? "NEW" : "MFT"}
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
          className={`w-full h-12 text-lg font-semibold glow-cyan ${isFinalized ? "bg-green-600 hover:bg-green-700" : "bg-cyan-600 hover:bg-cyan-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleAction}
          disabled={!canAct || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : !account ? (
            "Connect Wallet"
          ) : !amount || parseFloat(amount) <= 0 ? (
            "Enter an amount"
          ) : (
            isFinalized ? "Claim Tokens" : "Migrate"
          )}
        </Button>

        {/* Admin Toggle for Demo */}
        <div className="flex justify-center mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsFinalized(!isFinalized)} className="text-xs text-muted-foreground">
                [DEV] Toggle Status
            </Button>
        </div>

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
