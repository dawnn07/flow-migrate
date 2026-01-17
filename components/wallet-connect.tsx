"use client";

import { ConnectButton } from "@mysten/dapp-kit";

export function WalletConnect() {
  return (
    <div className="flex items-center gap-2">
      <ConnectButton
        className="!bg-cyan-600 !text-white !font-medium !rounded-lg !px-4 !py-2 hover:!bg-cyan-700 transition-colors !border-0"
        connectText="Connect Wallet"
      />
    </div>
  );
}
