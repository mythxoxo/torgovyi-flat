"use client";

import type { StatusItem, TechnicalStatusView } from "../lib/server/technical-status";

function Section({ title, items }: { title: string; items: readonly StatusItem[] }) {
  return (
    <section className="glass-card rounded-[24px] p-5">
      <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span>{label}</span>
            <span className="font-semibold text-[#c6d4ea]">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TechnicalStatusView({ locale, data }: { locale: "ru" | "en"; data: TechnicalStatusView }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,39,0.94),rgba(7,13,24,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">{locale === "ru" ? "Технический статус" : "Technical status"}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{locale === "ru" ? "Технический обзор" : "Technical review"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#c6d4ea]">
          {locale === "ru"
            ? "Показывает реальное состояние mainnet launchpad-ядра и что ещё не завершено в продукте."
            : "Shows the real mainnet launchpad-core state and what is still unfinished in the product."}
        </p>
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <Section title={locale === "ru" ? "Проверено" : "Verified"} items={data.verified} />
        <Section title={locale === "ru" ? "Работает сейчас" : "Working now"} items={data.ready} />
        <Section title={locale === "ru" ? "Не доделано" : "Still incomplete"} items={data.pending} />
      </div>
    </div>
  );
}
