"use client";

import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
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

  const featured = useMemo(() => tokens.slice(0, 3), [tokens]);

  return (
    <div className="space-y-5 pb-24">
      <section className="gram-hero rounded-[32px] p-5 sm:p-7">
        <div className="gram-orb" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c7a86b]/20 bg-[#c7a86b]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#f1d999]">
              <Search className="h-3.5 w-3.5" />
              {locale === "ru" ? "поиск launchpad" : "launchpad search"}
            </div>
            <h1 className="mt-5 font-display text-[2.45rem] font-black leading-[0.94] text-white sm:text-5xl">
              {locale === "ru" ? "Найди токен до толпы." : "Find launches before the crowd."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b8bec8] sm:text-base">
              {locale === "ru"
                ? "Ищи по имени, тикеру или адресу. Лента остаётся wallet-first и без custody."
                : "Search by name, ticker or address. The feed stays wallet-first and no-custody."}
            </p>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-[#8e929a]">{locale === "ru" ? "доступно" : "indexed"}</div>
            <div className="mt-2 text-4xl font-black text-white">{tokens.length}</div>
            <div className="mt-1 text-sm text-[#9ea6b2]">{locale === "ru" ? "токенов в поиске" : "tokens in search"}</div>
          </div>
        </div>

        <div className="relative z-10 mt-6 overflow-hidden rounded-[24px] border border-[#c7a86b]/16 bg-[#0a0b0d]/62 p-2 backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-[18px] bg-white/[0.04] px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-[#c7a86b]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                locale === "ru"
                  ? "Название, тикер или адрес токена"
                  : "Name, ticker or token address"
              }
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-[#8e929a]"
            />
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-[#f4ead2]">
          {error}
        </div>
      ) : null}

      {!query.trim() ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#c7a86b]/12 p-3 text-[#f1d999]"><Sparkles className="h-5 w-5" /></div>
              <div>
                <h3 className="font-display text-2xl font-black text-white">
                  {locale === "ru" ? "Начни с тикера" : "Start with a ticker"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#9ea6b2]">
                  {locale === "ru"
                    ? "Введи название, символ или адрес — результаты появятся здесь."
                    : "Type a name, symbol, or address — results will appear here."}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {featured.map((token) => (
                <button key={token.id} type="button" onClick={() => setQuery(token.ticker)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-[#f4ead2] hover:bg-[#c7a86b]/10">
                  {token.ticker}
                </button>
              ))}
            </div>
          </div>
          <Link href="/markets" className="group glass-card rounded-[28px] p-6 transition hover:border-[#c7a86b]/30">
            <div className="text-xs uppercase tracking-[0.18em] text-[#8e929a]">{locale === "ru" ? "рынки" : "markets"}</div>
            <div className="mt-2 font-display text-2xl font-black text-white">{locale === "ru" ? "Открой рейтинги" : "Open rankings"}</div>
            <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#f1d999]">
              {locale === "ru" ? "Смотреть рынки" : "View markets"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        </section>
      ) : (
        <TokenList tokens={filtered} loading={loading} searchQuery={query} />
      )}
    </div>
  );
}
