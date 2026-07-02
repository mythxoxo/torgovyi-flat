"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Rocket, ShieldCheck, Wallet } from "lucide-react";
import { CreateTokenForm } from "../../components/create-token-form";
import { getTelegramWebApp } from "../../lib/telegram";
import { useUi } from "../../components/page-shell";

export default function CreatePage() {
  const router = useRouter();
  const { t, locale } = useUi();

  useEffect(() => {
    const app = getTelegramWebApp();
    if (!app) return;
    const goBack = () => router.back();
    app.BackButton.show();
    app.BackButton.onClick(goBack);
    return () => {
      app.BackButton.hide();
      app.BackButton.offClick?.(goBack);
    };
  }, [router]);

  return (
    <div className="space-y-6 pb-24">
      <section className="pd-panel overflow-hidden rounded-[34px] p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="pd-chip pd-chip-hot"><Rocket className="h-3.5 w-3.5" /> Launch token</span>
              <span className="pd-chip pd-chip-blue">TON Blockchain</span>
              <span className="pd-chip pd-chip-live">Wallet signed</span>
            </div>
            <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.065em] text-white sm:text-6xl">{t.create.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#90a3b8]">{t.create.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="pd-stat"><ShieldCheck className="h-5 w-5 text-[#9cff2e]" /><div className="mt-2 font-black text-white">No custody</div><p className="mt-1 text-sm text-[#90a3b8]">{locale === "ru" ? "Wallet-signed only." : "Wallet-signed only."}</p></div>
            <div className="pd-stat"><Wallet className="h-5 w-5 text-[#5ac8fa]" /><div className="mt-2 font-black text-white">8888 GRAM</div><p className="mt-1 text-sm text-[#90a3b8]">{locale === "ru" ? "Публичный запуск начинается здесь." : "Public launch starts here."}</p></div>
          </div>
        </div>
      </section>
      <CreateTokenForm />
    </div>
  );
}
