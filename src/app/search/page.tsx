"use client";

import { useEffect, useMemo, useState } from "react";
import { TokenList } from "../../components/token-list";
import { getTokenList } from "../../lib/api";
import type { TokenRecord } from "../../lib/shared";
import { useUi } from "../../components/page-shell";

export default function SearchPage() {
  const { locale } = useUi();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList("new")
      .then(setTokens)
      .catch(() =>
        setError(
          locale === "ru"
            ? "Поиск временно недоступен. Повтори позже."
            : "Search is temporarily unavailable. Try again later."
        )
      )
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tokens.filter((token) => {
      const hay = [token.name, token.ticker, token.id].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [tokens, query]);

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,34,0.96),rgba(8,14,24,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">
          {locale === "ru" ? "Поиск" : "Search"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          {locale === "ru" ? "Поиск токенов" : "Search tokens"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c6d4ea]">
          {locale === "ru"
            ? "Ищи токены по имени, тикеру или адресу."
            : "Search launches by name, ticker or token address."}
        </p>
        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === "ru"
                ? "Название, тикер или адрес токена"
                : "Name, ticker or token address"
            }
            className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-[#8ba3c1]"
          />
        </div>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-[#c6d4ea]">
          {error}
        </div>
      ) : null}

      {!query.trim() ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-white">
            {locale === "ru" ? "Начни поиск" : "Start searching"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#c6d4ea]">
            {locale === "ru"
              ? "Начни вводить название или тикер."
              : "Start typing a name or ticker."}
          </p>
        </div>
      ) : (
        <TokenList tokens={filtered} loading={loading} searchQuery={query} />
      )}
    </div>
  );
}
