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
    if (tab === "gainers") {
      return tokens.filter((token) => token.state.progress > 0);
    }
    return tokens;
  }, [tab, tokens]);

  const tabs = [
    { id: "trending" as const, ru: "В тренде", en: "Trending" },
    { id: "volume" as const, ru: "Топ по объёму", en: "Top volume" },
    { id: "gainers" as const, ru: "Лидеры роста", en: "Gainers" },
    { id: "new" as const, ru: "Новые запуски", en: "New launches" }
  ];

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,34,0.96),rgba(8,14,24,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">
          {locale === "ru" ? "Рынки" : "Markets"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          {locale === "ru" ? "Рынки TONK.MEM" : "TONK.MEM markets"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c6d4ea]">
          {locale === "ru"
            ? "Следи за новыми запусками, объёмом и токенами, которые готовы двигаться дальше."
            : "Track new launches, volume and tokens that are ready to move further."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                tab === item.id
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-[#c6d4ea] hover:bg-white/10"
              }`}
            >
              {locale === "ru" ? item.ru : item.en}
            </button>
          ))}
        </div>
      </section>

      {!loading && view.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-white">
            {locale === "ru" ? "Пока пусто" : "Nothing here yet"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#c6d4ea]">
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
