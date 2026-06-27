"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketTokenList } from "../../components/market-token-list";
import type { MarketToken } from "../../lib/market/types";
import { searchMarketTokens } from "../../lib/market/search-market-tokens";
import { useUi } from "../../components/page-shell";

type SearchFilter = "all" | "launchpad" | "external" | "listed";

export default function SearchPage() {
  const { locale, theme } = useUi();
  const [items, setItems] = useState<MarketToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    searchMarketTokens(query, filter)
      .then((tokens) => {
        if (!cancelled) setItems(tokens.slice(0, 100));
      })
      .catch(() => {
        if (!cancelled) setError(locale === "ru" ? "Поиск временно недоступен. Повтори позже." : "Search is temporarily unavailable. Try again later.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, locale, query]);

  const visibleItems = useMemo(() => items, [items]);

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
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">{locale === "ru" ? "Поиск всех токенов" : "Search all tokens"}</h1>
        <p className={`mt-3 max-w-2xl text-sm leading-7 ${muted}`}>{locale === "ru" ? "Ищи launchpad, External, STON.fi и DeDust токены по имени, тикеру, адресу или DEX." : "Search launchpad, External, STON.fi and DeDust tokens by name, ticker, address or DEX."}</p>
        <div className={`mt-6 overflow-hidden rounded-2xl border ${input}`}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "ru" ? "Название, тикер, адрес, DeDust или STON.fi" : "Name, ticker, address, DeDust or STON.fi"} className="w-full bg-transparent px-4 py-4 text-sm outline-none" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === item.id ? "border-[#0088cc] bg-[#0088cc] text-white" : idleChip}`}>{locale === "ru" ? item.ru : item.en}</button>
          ))}
        </div>
      </section>

      {error ? <div className={`rounded-[24px] border p-6 text-sm ${panel}`}>{error}</div> : null}
      {!loading && visibleItems.length === 0 ? (
        <div className={`rounded-[24px] border p-8 text-center ${panel}`}>
          <h3 className="font-display text-2xl font-bold tracking-[-0.04em]">{locale === "ru" ? "Ничего не найдено" : "Nothing found"}</h3>
          <p className={`mt-3 text-sm leading-6 ${muted}`}>{locale === "ru" ? "Попробуй другой тикер, имя, адрес или DEX." : "Try another ticker, name, address or DEX."}</p>
        </div>
      ) : <MarketTokenList tokens={visibleItems} loading={loading} />}
    </div>
  );
}
