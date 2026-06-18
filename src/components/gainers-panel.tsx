"use client";

import { TrendingUp } from "lucide-react";
import { useUi } from "./page-shell";

const examples = [
  { wallet: "UQ...7F2a", token: "First launch", multiple: "8.4x", entry: "112 GRAM", value: "941 GRAM" },
  { wallet: "UQ...9Bb1", token: "Fresh mem", multiple: "6.9x", entry: "84 GRAM", value: "580 GRAM" },
  { wallet: "UQ...3C0d", token: "Blue chip", multiple: "5.2x", entry: "210 GRAM", value: "1,092 GRAM" }
];

export function GainersPanel() {
  const { locale } = useUi();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {examples.map((item) => (
        <div key={`${item.wallet}-${item.token}`} className="glass-card rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 text-[#86efac]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="font-mono text-2xl font-black text-[#86efac]">{item.multiple}</div>
          </div>
          <div className="mt-5 text-xs uppercase tracking-[0.18em] text-[#8ba3c1]">{locale === "ru" ? "Кошелёк" : "Wallet"}</div>
          <div className="mt-1 font-mono text-sm text-white">{item.wallet}</div>
          <div className="mt-4 text-xs uppercase tracking-[0.18em] text-[#8ba3c1]">{locale === "ru" ? "Запуск" : "Launch"}</div>
          <div className="mt-1 text-lg font-bold text-white">{item.token}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3"><div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Вход" : "Entry"}</div><div className="mt-1 font-semibold text-white">{item.entry}</div></div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3"><div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Сейчас" : "Now"}</div><div className="mt-1 font-semibold text-white">{item.value}</div></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#8ba3c1]">{locale === "ru" ? "После реальных запусков здесь будут live иксы по launchpad-токенам." : "After real launches this will show live multiples for launchpad tokens."}</p>
        </div>
      ))}
    </div>
  );
}
