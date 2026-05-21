"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateTokenForm } from "../../components/create-token-form";
import { getTelegramWebApp } from "../../lib/telegram";
import { useUi } from "../../components/page-shell";

export default function CreatePage() {
  const router = useRouter();
  const { t } = useUi();

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
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,39,0.94),rgba(7,13,24,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">TONK.MEM</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{t.create.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c6d4ea]">{t.create.subtitle}</p>
        </div>
      </section>
      <CreateTokenForm />
    </div>
  );
}
