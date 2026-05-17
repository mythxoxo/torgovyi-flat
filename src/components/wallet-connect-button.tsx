"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { useWallet } from "./wallet-context";

const shorten = (wallet: string): string => wallet.length < 12 ? wallet : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

export function WalletConnectButton() {
  const { wallet, walletSource, canUseDemoWallet, isTestnet, networkWarning, setDemoWallet } = useWallet();

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-1 shadow-neon">
        <TonConnectButton className="!w-auto" />
      </div>
      {walletSource === "tonconnect" && wallet ? (
        <div className={`rounded-lg px-3 py-2 text-xs ${isTestnet ? "bg-[color:var(--green-dim)] text-[color:var(--green)]" : "bg-[color:var(--red-dim)] text-[color:var(--red)]"}`}>
          {isTestnet ? "TESTNET" : "⚠️ MAINNET"} · {shorten(wallet)}
          {networkWarning ? <span className="block pt-1">Переключи TonKeeper в Testnet: Settings → Dev Tools → Switch to Testnet</span> : null}
        </div>
      ) : null}
      {canUseDemoWallet && !wallet ? <button type="button" onClick={() => setDemoWallet("EQDEMO11111111111111111111111111111111111111111")} className="hidden rounded-lg border border-[color:var(--border)] px-3 py-2 text-xs text-[color:var(--text-muted)] sm:block">Demo</button> : null}
    </div>
  );
}
