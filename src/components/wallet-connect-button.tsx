"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { useWallet } from "./wallet-context";

const shorten = (wallet: string): string => wallet.length < 12 ? wallet : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

export function WalletConnectButton() {
  const { wallet, walletSource, isMainnet } = useWallet();

  if (walletSource === "tonconnect" && wallet && isMainnet) {
    return <div className="rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-3 py-2 text-xs font-mono text-white">{shorten(wallet)}</div>;
  }

  return (
    <div className="rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-1 py-1">
      <TonConnectButton className="!w-auto" />
    </div>
  );
}
