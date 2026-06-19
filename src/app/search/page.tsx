"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketTokenList } from "../../components/market-token-list";
import { getTokenList } from "../../lib/api";
import type { ExternalTokenRecord } from "../../lib/external-tokens/types";
import type { MarketToken } from "../../lib/market/types";
import type { TokenRecord } from "../../lib/shared";
import { useUi } from "../../components/page-shell";

type SearchFilter = "all" | "launchpad" | "external" | "listed";

const toLaunchpadItems = (tokens: TokenRecord[]): MarketToken[] => tokens.map((token) => ({ source: "LAUNCHPAD", token }));
const toExternalItems = (tokens: ExternalTokenRecord[]): MarketToken[] => tokens.map((token) => ({ source: "EXTERNAL", token }));

export default function SearchPage() {
  const { locale, theme } = useUi();
  const [items, setItems] = useState<MarketToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [error, setError] = useState("");
  const [externalSource, setExternalSource] = useState<"stonfi-live" | "fallback" | "">("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setExternalSource("");

    const load = async () => {
      const [launchpad, externalResponse] = await Promise.all([
        filter === "external" ? Promise.resolve([] as TokenRecord[]) : getTokenList("trending"),
        filter === "launchpad" || filter === "listed" ? Promise.resolve(null) : fetch("/api/external-tokens", { cache: "no-store" }).then((res) => res.json())
      ]);

      const externalData = externalResponse as { ok?: boolean; source?: "stonfi-live" | "fallback"; tokens?: ExternalTokenRecord[] } | null;
      const external = externalData?.ok && externalData.tokens ? externalData.tokens : [];
      if (!cancelled) {
        setExternalSource(externalData?.source ?? "");
        setItems([...toLaunchpadItems(launchpad), ...toExternalItems(external)]);
      }
    };

    load()
      .catch(() => setError(locale === "ru" ? "Поиск временно недоступен. Повтори позже." : "Search is temporarily unavailable. Try again later."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, locale]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = items.filter((item) => {
      if (filter === "launchpad") return item.source === "LAUNCHPAD";
      if (filter === "external") return item.source === "EXTERNAL";
      if (filter === "listed") return item.source === "LAUNCHPAD" && (item.token.status === "LISTED" || item.token.status === "GRADUATED_READY");
      return true;
    });

    const filtered = q
      ? base.filter((item) => {
          const hay = item.source === "LAUNCHPAD"
            ? [item.token.name, item.token.ticker, item.token.id].join(" ").toLowerCase()
            : [item.token.name, item.token.symbol, item.token.address].join(" ").toLowerCase();
          return hay.includes(q);
        })
      : base;

    return filtered.slice(0, 16);
  }, [items, query, filter]);

  const panel = theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827] shadow-[0_24px_70px_rgba(15,23,42,0.08)]" : "border-white/10 bg-[#0f1724] text-white shadow-[0_24px_70px_rgba(0,0,0,0.26)]";
  const muted = theme === "light" ? "text-[#64748b]" : "text-[#8ba3c1]";
  const input = theme === "light" ? "border-[#dbe8f4] bg-[#f8fbff] text-[#111827] placeholder:text-[#94a3b8]" : "border-white/10 bg-white/5 text-white placeholder:text-[#8ba3c1]";
  const idleChip = theme === "light" ? "border-[#dbe8f4] bg-white text-[#475569]" : "border-white/10 bg-white/5 text-[#c6d4ea]";

  const filters: Array<{ id: SearchFilter; ru: string; en: string }> = [
    { id: "all", ru: "Все", en: "All" },
    { id: "launchpad", ru: "Запуски", en: "Launchpad" },
    { id: "external", ru: "External", en: "External" },
    { id: "listed", ru: "Listed", en: "Listed" }
  ];

  return (
    <div className="space-y-6 pb-24">
      <section className={`rounded-[32px] border p-7 ${panel}`}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088cc]">{locale === "ru" ? "Поиск рынков" : "Market search"}</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">{locale === "ru" ? "Поиск токенов" : "Search tokens"}</h1>
        <p className={`mt-3 max-w-2xl text-sm leading-7 ${muted}`}>{locale === "ru" ? "Ищи запуски TONS of GRAM отдельно от live External DEX токенов." : "Search TONS of GRAM launches separately from live External DEX tokens."}</p>
        <div className={`mt-6 overflow-hidden rounded-2xl border ${input}`}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "ru" ? "Название, тикер или адрес токена" : "Name, ticker or token address"} className="w-full bg-transparent px-4 py-4 text-sm outline-none" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === item.id ? "border-[#0088cc] bg-[#0088cc] text-white" : idleChip}`}>{locale === "ru" ? item.ru : item.en}</button>
          ))}
        </div>
        {(filter === "all" || filter === "external") && externalSource ? <p className={`mt-3 text-xs ${muted}`}>{externalSource === "stonfi-live" ? (locale === "ru" ? "External источник: live STON.fi assets" : "External source: live STON.fi assets") : (locale === "ru" ? "External источник: fallback список" : "External source: fallback list")}</p> : null}
      </section>

      {error ? <div className={`rounded-[24px] border p-6 text-sm ${panel}`}>{error}</div> : null}
      {!loading && visibleItems.length === 0 ? (
        <div className={`rounded-[24px] border p-8 text-center ${panel}`}>
          <h3 className="font-display text-2xl font-bold tracking-[-0.04em]">{locale === "ru" ? "Ничего не найдено" : "Nothing found"}</h3>
          <p className={`mt-3 text-sm leading-6 ${muted}`}>{locale === "ru" ? "Попробуй другой тикер, имя или адрес." : "Try another ticker, name or address."}</p>
        </div>
      ) : <MarketTokenList tokens={visibleItems} loading={loading} />}
    </div>
  );
}
