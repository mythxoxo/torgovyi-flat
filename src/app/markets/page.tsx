"use client";

import { useEffect, useState } from "react";
import { GainersPanel } from "../../components/gainers-panel";
import { MarketTokenList } from "../../components/market-token-list";
import { useUi } from "../../components/page-shell";
import type { ExternalTokenRecord } from "../../lib/external-tokens/types";
import { listMarketTokens } from "../../lib/market/list-market-tokens";
import type { MarketFilter, MarketToken } from "../../lib/market/types";

type ExternalSource = "live-external" | "snapshot-external" | "unavailable" | "";

export default function MarketsPage() {
  const { locale, theme } = useUi();
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

    return () => {
      cancelled = true;
    };
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

  const panel = theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827]" : "border-white/10 bg-[#0f1724] text-white";
  const muted = theme === "light" ? "text-[#64748b]" : "text-[#8ba3c1]";
  const inactive = theme === "light" ? "border-[#dbe8f4] bg-white text-[#475569]" : "border-white/10 bg-white/5 text-[#c6d4ea]";
  const externalSourceLabel = externalSource === "live-external"
    ? (locale === "ru" ? "Источник: live external assets" : "Source: live external assets")
    : externalSource === "snapshot-external"
      ? (locale === "ru" ? "Источник: real cached DEX snapshot" : "Source: real cached DEX snapshot")
      : (locale === "ru" ? "Источник: недоступен" : "Source: unavailable");

  return (
    <div className="space-y-6 pb-24">
      <section className={`rounded-[32px] border p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ${panel}`}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088cc]">{locale === "ru" ? "Launchpad рынки" : "Launchpad markets"}</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">{locale === "ru" ? "Рынки запусков" : "Launch markets"}</h1>
        <p className={`mt-3 max-w-2xl text-sm leading-7 ${muted}`}>{locale === "ru" ? "Запуски TONS of GRAM отдельно. External — отдельная вкладка с DEX токенами." : "TONS of GRAM launches stay separate. External is a separate tab for DEX tokens."}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${tab === item.id ? "border-[#0088cc] bg-[#0088cc] text-white" : inactive}`}>{locale === "ru" ? item.ru : item.en}</button>
          ))}
        </div>
        {tab === "external" && externalSource ? <p className={`mt-3 text-xs ${muted}`}>{externalSourceLabel}</p> : null}
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
