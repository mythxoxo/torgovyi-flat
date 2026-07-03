"use client";

import { Wallet } from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

const shorten = (wallet: string): string => (wallet.length < 12 ? wallet : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const label = address ? shorten(address) : "Connect";

  return (
    <button type="button" aria-label="Connect wallet" onClick={() => tonConnectUI.openModal()} className={`wallet-cta ${compact ? "wallet-cta--compact" : ""}`}>
      <Wallet className="wallet-cta__icon" aria-hidden="true" />
      <span className="wallet-cta__fallback-label">{label}</span>
    </button>
  );
}
