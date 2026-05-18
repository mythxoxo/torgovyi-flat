"use client";

import { TonConnectButton } from "@tonconnect/ui-react";

import { useWallet } from "./wallet-context";

const shorten = (wallet: string): string =>
  wallet.length < 12 ? wallet : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const {
    wallet,
    walletSource,
    canUseDemoWallet,
    isMainnet,
    networkLabel,
    networkWarning,
    setDemoWallet
  } = useWallet();

  return (
    <div className={compact ? "flex items-center justify-end" : "flex flex-col gap-2"}>
      <TonConnectButton className="!w-full" />
      {!compact && walletSource === "tonconnect" ? (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            isMainnet
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
              : "border-amber-400/30 bg-amber-400/10 text-amber-100"
          }`}
        >
          Network: {networkLabel}
          {networkWarning ? <span className="block pt-1">{networkWarning}</span> : null}
        </div>
      ) : null}
      {!compact && canUseDemoWallet ? (
        <button
          type="button"
          onClick={() => setDemoWallet("EQDEMO11111111111111111111111111111111111111111")}
          className="rounded-lg border border-line px-4 py-2 text-sm text-mist transition hover:border-cyan-300 hover:text-ink"
        >
          {walletSource === "tonconnect" ? `Connected: ${shorten(wallet)}` : `Demo wallet: ${shorten(wallet)}`}
        </button>
      ) : !compact && wallet ? (
        <div className="rounded-lg border border-line px-4 py-2 text-sm text-mist">
          Connected: {shorten(wallet)}
        </div>
      ) : null}
    </div>
  );
}
