"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { useWallet } from "./wallet-context";

const shorten = (wallet: string): string =>
  wallet.length < 12 ? wallet : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

export function WalletConnectButton() {
  const { wallet, walletSource, canUseDemoWallet, isTestnet, networkWarning, setDemoWallet } = useWallet();

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-2 py-1 [&_button]:!h-10 [&_button]:!rounded-lg [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!text-white">
        <TonConnectButton className="!w-auto" />
      </div>
      {walletSource === "tonconnect" && wallet ? (
        <div className={`rounded-xl px-3 py-2 text-xs ${isTestnet ? "bg-[#00c896]/15 text-[#00c896]" : "bg-[#ff4757]/15 text-[#ff4757]"}`}>
          {shorten(wallet)}{networkWarning ? ` · ${networkWarning}` : ""}
        </div>
      ) : null}
      {canUseDemoWallet && !wallet ? (
        <button type="button" onClick={() => setDemoWallet("EQDEMO11111111111111111111111111111111111111111")} className="hidden rounded-xl border border-[#1e3a5f] px-3 py-2 text-xs text-[#8ba3c1] sm:block">
          Demo
        </button>
      ) : null}
    </div>
  );
}
