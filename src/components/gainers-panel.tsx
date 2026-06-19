"use client";

import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { GainerRecord, GainerSource } from "../lib/gainers/types";
import { useUi } from "./page-shell";

type GainersResponse = {
  ok: boolean;
  source?: GainerSource;
  records?: GainerRecord[];
};

const formatGram = (value: number) => `${value.toLocaleString("en-US")} GRAM`;

export function GainersPanel() {
  const { locale } = useUi();
  const [records, setRecords] = useState<GainerRecord[]>([]);
  const [source, setSource] = useState<GainerSource>("fallback");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/gainers", { cache: "no-store" })
      .then((res) => res.json() as Promise<GainersResponse>)
      .then((data) => {
        if (cancelled) return;
        setRecords(data.records ?? []);
        setSource(data.source ?? "fallback");
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="glass-card rounded-[24px] p-6 text-sm text-[#8ba3c1]">{locale === "ru" ? "Загружаю gainers..." : "Loading gainers..."}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-[24px] p-4 text-xs leading-5 text-[#8ba3c1]">
        {source === "live" ? (locale === "ru" ? "Источник: live иксы launchpad-трейдеров" : "Source: live launchpad trader multiples") : (locale === "ru" ? "Источник: fallback, пока нет live PnL индекса." : "Source: fallback until live PnL indexing is available.")}
        <span className="block mt-1">{locale === "ru" ? "Live иксы появятся после реальных запусков и индексации сделок." : "Live multiples require real launches and trade indexing."}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {records.map((item) => (
          <div key={`${item.wallet}-${item.token}`} className="glass-card rounded-[24px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 text-[#86efac]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="font-mono text-2xl font-black text-[#86efac]">{item.multiple.toFixed(1)}x</div>
            </div>
            <div className="mt-5 text-xs uppercase tracking-[0.18em] text-[#8ba3c1]">{locale === "ru" ? "Кошелёк" : "Wallet"}</div>
            <div className="mt-1 font-mono text-sm text-white">{item.wallet}</div>
            <div className="mt-4 text-xs uppercase tracking-[0.18em] text-[#8ba3c1]">{locale === "ru" ? "Запуск" : "Launch"}</div>
            <div className="mt-1 text-lg font-bold text-white">{item.token}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-3"><div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Вход" : "Entry"}</div><div className="mt-1 font-semibold text-white">{formatGram(item.entryGram)}</div></div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-3"><div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Сейчас" : "Now"}</div><div className="mt-1 font-semibold text-white">{formatGram(item.valueGram)}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
