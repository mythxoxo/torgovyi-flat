"use client";

import { Wallet, ShieldCheck, Sparkles } from "lucide-react";
import { useWallet } from "../../components/wallet-context";
import { WalletAssetsPanel } from "../../components/wallet-assets-panel";
import { useUi } from "../../components/page-shell";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const { t, locale } = useUi();

  return (
    <div className="space-y-6 pb-24">
      <section className="pd-panel overflow-hidden rounded-[34px] p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="pd-chip pd-chip-blue"><Wallet className="h-3.5 w-3.5" /> Wallet profile</span>
              <span className="pd-chip pd-chip-live">Assets</span>
              <span className="pd-chip pd-chip-hot">My launches</span>
            </div>
            <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.065em] text-white sm:text-6xl">{t.profile.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#90a3b8]">{wallet ? t.profile.subtitle : t.profile.connect}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:w-[460px]">
            <div className="pd-stat"><ShieldCheck className="h-5 w-5 text-[#9cff2e]" /><div className="mt-2 font-black text-white">{wallet ? "Connected" : "Disconnected"}</div><p className="mt-1 text-sm text-[#90a3b8]">{locale === "ru" ? "Состояние кошелька." : "Wallet state."}</p></div>
            <div className="pd-stat"><Sparkles className="h-5 w-5 text-[#ff7fc3]" /><div className="mt-2 font-black text-white">Portfolio</div><p className="mt-1 text-sm text-[#90a3b8]">{locale === "ru" ? "TON и токены в одном месте." : "TON and tokens in one place."}</p></div>
          </div>
        </div>
      </section>
      <WalletAssetsPanel />
    </div>
  );
}
