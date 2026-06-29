"use client";

import { Wallet } from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useUi } from "./page-shell";

const shorten = (wallet: string): string => (wallet.length < 12 ? wallet : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { locale } = useUi();
  const connectLabel = locale === "ru" ? "Подключить TON кошелёк" : "Connect TON wallet";
  const disconnectLabel = locale === "ru" ? "Отключить TON кошелёк" : "Disconnect TON wallet";

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <button type="button" aria-label={connectLabel} onClick={() => tonConnectUI.openModal()} className={`wallet-cta ${compact ? "wallet-cta--compact" : ""}`}>
          <Wallet className="wallet-cta__icon" aria-hidden="true" />
          <span className="wallet-cta__fallback-label">{shorten(address)}</span>
        </button>
        <button type="button" aria-label={disconnectLabel} onClick={() => tonConnectUI.disconnect()} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#c7d5e8] hover:bg-white/10">
          {locale === "ru" ? "Отключить" : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <button type="button" aria-label={connectLabel} onClick={() => tonConnectUI.openModal()} className={`wallet-cta ${compact ? "wallet-cta--compact" : ""}`}>
      <Wallet className="wallet-cta__icon" aria-hidden="true" />
      <span className="wallet-cta__fallback-label">{locale === "ru" ? "Подключить" : "Connect"}</span>
    </button>
  );
}
