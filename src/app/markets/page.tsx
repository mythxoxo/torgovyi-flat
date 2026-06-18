"use client";

import { useEffect, useMemo, useState } from "react";
import { getTokenList } from "../../lib/api";
import type { TokenRecord } from "../../lib/shared";
import { TokenList } from "../../components/token-list";
import { useUi } from "../../components/page-shell";

export default function MarketsPage() {
  const { locale, theme } = useUi();
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
    if (tab === "new") return [...tokens].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (tab === "volume") return [...tokens].sort((a, b) => (b.state.volumeTon ?? 0) - (a.state.volumeTon ?? 0));
    if (tab === "gainers") return [...tokens].filter((token) => (token.state.volumeTon ?? 0) > 0).sort((a, b) => (b.state.progress ?? 0) - (a.state.progress ?? 0));
    return [...tokens].sort((a, b) => ((b.state.volumeTon ?? 0) + b.trades.length) - ((a.state.volumeTon ?? 0) + a.trades.length));
  }, [tab, tokens]);

  const tabs = [
    { id: "trending" as const, ru: "В тренде", en: "Trending" },
    { id: "volume" as const, ru: "Топ по объёму", en: "Top volume" },
    { id: "gainers" as const, ru: "Лидеры роста", en: "Gainers" },
    { id: "new" as const, ru: "Новые запуски", en: "New launches" }
  ];

  const panel = theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827]" : "border-white/10 bg-[#0f1724] text-white";
  const muted = theme === "light" ? "text-[#64748b]" : "text-[#8ba3c1]";
  const inactive = theme === "light" ? "border-[#dbe8f4] bg-white text-[#475569]" : "border-white/10 bg-white/5 text-[#c6d4ea]";

  return (
    <div className="space-y-6 pb-24">
      <section className={`rounded-[32px] border p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ${panel}`}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088cc]">{locale === "ru" ? "Рынки" : "Markets"}</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">{locale === "ru" ? "Рынки TONS of GRAM" : "TONS of GRAM markets"}</h1>
        <p className={`mt-3 max-w-2xl text-sm leading-7 ${muted}`}>{locale === "ru" ? "Следи за новыми запусками, объёмом и токенами, которые готовы двигаться дальше." : "Track new launches, volume and tokens ready to move further."}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${tab === item.id ? "border-[#0088cc] bg-[#0088cc] text-white" : inactive}`}>{locale === "ru" ? item.ru : item.en}</button>
          ))}
        </div>
      </section>

      {!loading && view.length === 0 ? (
        <div className={`rounded-[24px] border p-8 text-center ${panel}`}>
          <h3 className="font-display text-2xl font-bold tracking-[-0.04em]">{locale === "ru" ? "Пока пусто" : "Nothing here yet"}</h3>
          <p className={`mt-3 text-sm leading-6 ${muted}`}>{locale === "ru" ? "Рейтинги появятся после первых индексированных сделок." : "Rankings will appear after indexed trades."}</p>
        </div>
      ) : (
        <TokenList tokens={view} loading={loading} />
      )}
    </div>
  );
}
