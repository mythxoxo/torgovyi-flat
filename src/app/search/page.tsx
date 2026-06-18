"use client";

import { useEffect, useMemo, useState } from "react";
import { TokenList } from "../../components/token-list";
import { getTokenList } from "../../lib/api";
import type { TokenRecord } from "../../lib/shared";
import { useUi } from "../../components/page-shell";

type SearchFilter = "all" | "trending" | "new" | "verified";

export default function SearchPage() {
  const { locale, theme } = useUi();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList(filter === "new" ? "new" : "trending")
      .then(setTokens)
      .catch(() =>
        setError(
          locale === "ru"
            ? "Поиск временно недоступен. Повтори позже."
            : "Search is temporarily unavailable. Try again later."
        )
      )
      .finally(() => setLoading(false));
  }, [filter, locale]);

  const visibleTokens = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = tokens.filter((token) => {
      if (filter === "verified") return token.status === "LISTED" || token.status === "GRADUATED_READY";
      return true;
    });
    if (!q) return base.slice(0, 8);
    return base.filter((token) => {
      const hay = [token.name, token.ticker, token.id].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [tokens, query, filter]);

  const panel = theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827] shadow-[0_24px_70px_rgba(15,23,42,0.08)]" : "border-white/10 bg-[#0f1724] text-white shadow-[0_24px_70px_rgba(0,0,0,0.26)]";
  const muted = theme === "light" ? "text-[#64748b]" : "text-[#8ba3c1]";
  const input = theme === "light" ? "border-[#dbe8f4] bg-[#f8fbff] text-[#111827] placeholder:text-[#94a3b8]" : "border-white/10 bg-white/5 text-white placeholder:text-[#8ba3c1]";
  const idleChip = theme === "light" ? "border-[#dbe8f4] bg-white text-[#475569]" : "border-white/10 bg-white/5 text-[#c6d4ea]";

  const filters: Array<{ id: SearchFilter; ru: string; en: string }> = [
    { id: "all", ru: "Все", en: "All" },
    { id: "trending", ru: "В тренде", en: "Trending" },
    { id: "new", ru: "Новые", en: "New" },
    { id: "verified", ru: "Проверенные", en: "Verified" }
  ];

  return (
    <div className="space-y-6 pb-24">
      <section className={`rounded-[32px] border p-7 ${panel}`}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088cc]">
          {locale === "ru" ? "Поиск" : "Search"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">
          {locale === "ru" ? "Поиск токенов" : "Search tokens"}
        </h1>
        <p className={`mt-3 max-w-2xl text-sm leading-7 ${muted}`}>
          {locale === "ru"
            ? "Ищи токены по имени, тикеру или адресу."
            : "Search launches by name, ticker or token address."}
        </p>
        <div className={`mt-6 overflow-hidden rounded-2xl border ${input}`}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === "ru"
                ? "Название, тикер или адрес токена"
                : "Name, ticker or token address"
            }
            className="w-full bg-transparent px-4 py-4 text-sm outline-none"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === item.id ? "border-[#0088cc] bg-[#0088cc] text-white" : idleChip}`}
            >
              {locale === "ru" ? item.ru : item.en}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className={`rounded-[24px] border p-6 text-sm ${panel}`}>
          {error}
        </div>
      ) : null}

      {!loading && visibleTokens.length === 0 ? (
        <div className={`rounded-[24px] border p-8 text-center ${panel}`}>
          <h3 className="font-display text-2xl font-bold tracking-[-0.04em]">
            {locale === "ru" ? "Ничего не найдено" : "Nothing found"}
          </h3>
          <p className={`mt-3 text-sm leading-6 ${muted}`}>
            {locale === "ru"
              ? "Попробуй другой тикер, имя или адрес."
              : "Try another ticker, name or address."}
          </p>
        </div>
      ) : (
        <TokenList tokens={visibleTokens} loading={loading} searchQuery={query} />
      )}
    </div>
  );
}
