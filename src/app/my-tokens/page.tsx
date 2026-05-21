"use client";

import { useWallet } from "../../components/wallet-context";
import { WalletAssetsPanel } from "../../components/wallet-assets-panel";
import { useUi } from "../../components/page-shell";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const { t } = useUi();

  return (
    <div className="space-y-5 pb-24">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">TONK.MEM</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{t.profile.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#c6d4ea]">
          {wallet ? t.profile.subtitle : t.profile.connect}
        </p>
      </section>
      <WalletAssetsPanel />
    </div>
  );
}
