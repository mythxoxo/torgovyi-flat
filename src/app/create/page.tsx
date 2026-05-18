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
        <p className="mb-1 text-xs uppercase tracking-wide text-[#8ba3c1]">Запуск</p>
        <h2 className="font-display text-2xl font-bold text-white">Создай мем-токен</h2>
        <p className="mt-2 text-sm text-[#8ba3c1]">Заполни карточку и запусти токен прямо в TON.</p>
      </section>
      <CreateTokenForm />
    </div>
  );
}
