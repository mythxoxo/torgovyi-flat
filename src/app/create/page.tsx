"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateTokenForm } from "../../components/create-token-form";
import { getTelegramWebApp } from "../../lib/telegram";

export default function CreatePage() {
  const router = useRouter();

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
    <div className="space-y-4 pb-24 pt-4">
      <section className="px-4">
        <div className="glass-card relative overflow-hidden rounded-[24px] p-5">
          <div className="absolute inset-0">
            <img src="/brand/img_05.jpg" alt="Create token" className="h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,12,24,0.94),rgba(6,12,24,0.66))]" />
          </div>
          <div className="relative max-w-md">
            <p className="mb-1 text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Create / Launch</p>
            <h2 className="font-display text-3xl font-bold text-white">Создай мем-токен</h2>
            <p className="mt-2 text-sm leading-6 text-[#c4d7ef]">Загрузи арт, задай тикер и выкати токен в премиальном лончпаде TONK.MEM.</p>
          </div>
        </div>
      </section>
      <CreateTokenForm />
    </div>
  );
}
