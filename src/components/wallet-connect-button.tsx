"use client";

import { Wallet } from "lucide-react";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useUi } from "./page-shell";

const shorten = (wallet: string): string => wallet.length < 12 ? wallet : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const { locale } = useUi();
  const connected = Boolean(wallet && address);

  return (
    <button type="button" onClick={() => tonConnectUI.openModal()} className={`wallet-cta ${compact ? "wallet-cta--compact" : ""}`}>
      <Wallet className="wallet-cta__icon" />
      <span className="wallet-cta__fallback-label">{connected ? shorten(address) : compact ? (locale === "ru" ? "Кошелёк" : "Wallet") : (locale === "ru" ? "Подключить кошелёк" : "Connect wallet")}</span>
    </button>
  );
}
