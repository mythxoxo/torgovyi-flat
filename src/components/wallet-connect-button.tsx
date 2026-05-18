"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { useWallet } from "./wallet-context";

const shorten = (wallet: string): string => wallet.length < 12 ? wallet : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

export function WalletConnectButton() {
  const { wallet, walletSource, networkWarning, isMainnet } = useWallet();

  if (walletSource === "tonconnect" && wallet) {
    return (
      <div className={`rounded-xl border px-3 py-2 text-xs font-mono ${isMainnet ? "border-[#1e3a5f] bg-[#1a2235] text-white" : "border-[#ff4757]/30 bg-[#ff4757]/10 text-[#ff4757]"}`}>
        {isMainnet ? shorten(wallet) : "Нужен mainnet"}
        {networkWarning && !isMainnet ? <span className="block pt-1 font-sans text-[10px]">{networkWarning}</span> : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-1 py-1">
      <TonConnectButton className="!w-auto" />
    </div>
  );
}
