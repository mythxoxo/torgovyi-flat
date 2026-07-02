"use client";

import { useEffect, useState } from "react";
import { BarChart3, Flame, Search, TrendingUp, Zap } from "lucide-react";
import { GainersPanel } from "../../components/gainers-panel";
import { MarketTokenList } from "../../components/market-token-list";
import { useUi } from "../../components/page-shell";
import type { ExternalTokenRecord } from "../../lib/external-tokens/types";
import { listMarketTokens } from "../../lib/market/list-market-tokens";
import type { MarketFilter, MarketToken } from "../../lib/market/types";

type ExternalSource = "live-external" | "snapshot-external" | "unavailable" | "";

export default function MarketsPage() {
  const { locale } = useUi();
  const [tokens, setTokens] = useState<MarketToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<MarketFilter>("trending");
  const [externalSource, setExternalSource] = useState<ExternalSource>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExternalSource("");

    const load = async () => {
      if (tab === "external") {
        const res = await fetch("/api/external-tokens", { cache: "no-store" });
        const data = await res.json() as { ok: boolean; source?: ExternalSource; tokens?: ExternalTokenRecord[] };
        if (!data.tokens) throw new Error("External source failed");
        if (!cancelled) {
          setExternalSource(data.source ?? (data.ok ? "live-external" : "unavailable"));
          setTokens(data.tokens.map((token) => ({ source: "EXTERNAL", token })));
        }
        return;
      }

      const marketTokens = await listMarketTokens(tab);
      if (!cancelled) setTokens(marketTokens);
    };

    load()
      .catch(() => {
        if (!cancelled) {
          setTokens([]);
          if (tab === "external") setExternalSource("unavailable");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tab]);

  const tabs: Array<{ id: MarketFilter; ru: string; en: string }> = [
    { id: "trending", ru: "Запуски", en: "Launches" },
    { id: "volume", ru: "Топ объёма", en: "Top volume" },
    { id: "gainers", ru: "Gainers", en: "Gainers" },
    { id: "new", ru: "Новые", en: "New" },
    { id: "graduated", ru: "Graduated", en: "Graduated" },
    { id: "listed", ru: "Listed", en: "Listed" },
    { id: "external", ru: "External", en: "External" }
  ];

  const externalSourceLabel = externalSource === "live-external"
    ? (locale === "ru" ? "Источник: live external assets" : "Source: live external assets")
    : externalSource === "snapshot-external"
      ? (locale === "ru" ? "Источник: cached DEX snapshot" : "Source: cached DEX snapshot")
      : (locale === "ru" ? "Источник: недоступен" : "Source: unavailable");

  return (
    <div className="space-y-6 pb-24">
      <section className="pd-panel overflow-hidden rounded-[34px] p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="pd-chip pd-chip-hot"><Flame className="h-3.5 w-3.5" /> Markets</span>
              <span className="pd-chip pd-chip-blue">Launchpad + DEX</span>
              <span className="pd-chip pd-chip-live">Live metrics</span>
            </div>
            <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.065em] text-white sm:text-6xl">{locale === "ru" ? "Рынки TON" : "TON markets"}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#90a3b8]">{locale === "ru" ? "Запуски TONS of GRAM и External DEX токены в одной чистой витрине. Данные остаются из текущего pipeline." : "TONS of GRAM launches and External DEX tokens in one clean market view. Data stays on the current pipeline."}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
            <div className="pd-stat"><BarChart3 className="h-4 w-4 text-[#9cff2e]" /><div className="mt-2 text-2xl font-black text-white">{tokens.length}</div><div className="text-xs text-[#90a3b8]">{locale === "ru" ? "токенов" : "tokens"}</div></div>
            <div className="pd-stat"><TrendingUp className="h-4 w-4 text-[#ff7fc3]" /><div className="mt-2 text-2xl font-black text-[#9cff2e]">24H</div><div className="text-xs text-[#90a3b8]">{locale === "ru" ? "метрики" : "metrics"}</div></div>
            <div className="pd-stat"><Search className="h-4 w-4 text-[#5ac8fa]" /><div className="mt-2 text-2xl font-black text-white">DEX</div><div className="text-xs text-[#90a3b8]">External</div></div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${tab === item.id ? "border-[#ff3d9a] bg-[#ff3d9a] text-white" : "border-white/10 bg-white/5 text-[#cbd5e1] hover:border-[#ff3d9a]/50 hover:text-white"}`}>{locale === "ru" ? item.ru : item.en}</button>
          ))}
        </div>
        {tab === "external" && externalSource ? <p className="mt-3 text-xs text-[#90a3b8]">{externalSourceLabel}</p> : null}
      </section>
      {tab === "gainers" ? (
        <GainersPanel />
      ) : (
        <MarketTokenList
          tokens={tokens}
          loading={loading}
          emptyTitle={tab === "external" ? (locale === "ru" ? "External временно недоступен" : "External is temporarily unavailable") : undefined}
          emptyText={tab === "external" ? (locale === "ru" ? "Live source и cached snapshot не вернули токены. Это аварийное состояние, а не нормальная витрина." : "Live source and cached snapshot returned no tokens. This is a failure state, not the normal market view.") : undefined}
        />
      )}
    </div>
  );
}
