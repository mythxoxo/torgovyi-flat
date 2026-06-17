"use client";

import { useEffect, useMemo, useState } from "react";
import { getTokenList } from "../../lib/api";
import type { TokenRecord } from "../../lib/shared";
import { TokenList } from "../../components/token-list";
import { useUi } from "../../components/page-shell";

export default function MarketsPage() {
  const { locale } = useUi();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"trending" | "volume" | "gainers" | "new">("trending");

  useEffect(() => {
    setLoading(true);
    getTokenList(tab === "new" ? "new" : tab === "volume" ? "top-volume" : "trending")
      .then(setTokens)
      .catch(() => setTokens([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const view = useMemo(() => {
    if (tab === "new") {
      return [...tokens].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    if (tab === "volume") {
      return [...tokens].sort((a, b) => (b.state.volumeTon ?? 0) - (a.state.volumeTon ?? 0));
    }
    if (tab === "gainers") {
      return [...tokens].filter((token) => (token.state.volumeTon ?? 0) > 0).sort((a, b) => (b.state.progress ?? 0) - (a.state.progress ?? 0));
    }
    return [...tokens].sort((a, b) => ((b.state.volumeTon ?? 0) + b.trades.length) - ((a.state.volumeTon ?? 0) + a.trades.length));
  }, [tab, tokens]);

  const tabs = [
    { id: "trending" as const, ru: "В тренде", en: "Trending" },
    { id: "volume" as const, ru: "Топ по объёму", en: "Top volume" },
    { id: "gainers" as const, ru: "Лидеры роста", en: "Gainers" },
    { id: "new" as const, ru: "Новые запуски", en: "New launches" }
  ];

  return (
    <div className="space-y-5 pb-24">
      <section className="gram-hero rounded-[32px] p-5 sm:p-7">
        <div className="gram-orb" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f1d999]">
              {locale === "ru" ? "Рынки" : "Markets"}
            </p>
            <h1 className="mt-3 font-display text-[2.45rem] font-black leading-[0.94] text-white sm:text-5xl">
              {locale === "ru" ? "Рынки TONS of GRAM" : "TONS of GRAM markets"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b8bec8] sm:text-base">
              {locale === "ru"
                ? "Следи за новыми запусками, объёмом и прогрессом в единой launchpad-ленте."
                : "Track new launches, volume and progress in one launchpad feed."}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-[#8e929a]">{locale === "ru" ? "показано" : "shown"}</div>
            <div className="mt-2 text-4xl font-black text-white">{view.length}</div>
            <div className="mt-1 text-sm text-[#9ea6b2]">{locale === "ru" ? "токенов" : "tokens"}</div>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === item.id
                  ? "bg-[#c7a86b] text-[#0a0b0d]"
                  : "border border-white/10 bg-white/5 text-[#cfd3da] hover:bg-[#c7a86b]/10"
              }`}
            >
              {locale === "ru" ? item.ru : item.en}
            </button>
          ))}
        </div>
      </section>

      {!loading && view.length === 0 ? (
        <div className="glass-card rounded-[28px] p-8 text-center">
          <h3 className="font-display text-2xl font-black text-white">
            {locale === "ru" ? "Пока пусто" : "Nothing here yet"}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#9ea6b2]">
            {locale === "ru"
              ? "Рейтинги появятся после первых индексированных сделок."
              : "Market rankings will appear after indexed trades."}
          </p>
        </div>
      ) : (
        <TokenList tokens={view} loading={loading} />
      )}
    </div>
  );
}
