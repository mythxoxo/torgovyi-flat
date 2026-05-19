"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { Wallet } from "lucide-react";
import { useWallet } from "./wallet-context";

const shorten = (wallet: string): string => wallet.length < 12 ? wallet : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

export function WalletConnectButton({ compact = false, label }: { compact?: boolean; label?: string }) {
  const { wallet, walletSource, isMainnet } = useWallet();

  if (walletSource === "tonconnect" && wallet && isMainnet) {
    return <div className="inline-flex items-center gap-2 rounded-full border border-[#1f486e] bg-[#0f1b2d] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)]"><Wallet className="h-4 w-4 text-[#7dd3fc]" />{shorten(wallet)}</div>;
  }

  return (
    <div className={`wallet-cta ${compact ? "wallet-cta--compact" : ""}`}>
      <Wallet className="wallet-cta__icon" />
      <TonConnectButton className="!w-auto" />
      {label ? <span className="wallet-cta__fallback-label">{label}</span> : null}
    </div>
  );
}
