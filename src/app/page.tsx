"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";

const tabs = [
  { key: "trending", label: "Тренд" },
  { key: "new", label: "Новые" },
  { key: "almost-graduated", label: "Почти" },
  { key: "graduated", label: "Вышли" },
  { key: "top-volume", label: "Объём" }
] as const;

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("trending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    setVisibleCount(6);
    getTokenList(active)
      .then(setTokens)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Не удалось загрузить токены"))
      .finally(() => setLoading(false));
  }, [active]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 6, filtered.length || prev + 6));
      }
    }, { rootMargin: "200px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [tokens, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q));
  }, [tokens, query]);

  const visibleTokens = filtered.slice(0, visibleCount);
  const tickerTrades = tokens.flatMap((token) => token.trades.slice(-2).map((trade) => ({
    id: trade.id,
    type: trade.side === "BUY" ? "buy" : "sell",
    user: trade.wallet.slice(0, 4),
    amount: (trade.side === "BUY" ? trade.tonAmountGross : trade.tonAmountNet).toFixed(2),
    tokenName: token.name,
    timestamp: trade.createdAt
  })));

  const timeAgo = (value: string) => {
    const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
    if (mins < 1) return "только что";
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} дн назад`;
  };

  return (
    <div className="relative pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image src="/brand/img_12.jpg" alt="" fill className="object-cover opacity-[0.08]" priority />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,136,204,0.22),transparent_32%),linear-gradient(180deg,rgba(5,10,20,0.35),rgba(5,10,20,0.92))]" />
      </div>
      <div className="relative z-10">
      <section className="px-4 pt-4">
        <div className="glass-card relative overflow-hidden rounded-[28px] border border-white/10 p-5 sm:p-6">
          <div className="absolute inset-0">
            <Image src="/brand/img_01.jpg" alt="TONK.MEM hero" fill className="object-cover opacity-40" priority />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,12,24,0.92),rgba(6,12,24,0.52)_48%,rgba(6,12,24,0.88))]" />
          </div>
          <div className="relative max-w-[26rem]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6ee7ff]/20 bg-[#0b1325]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc]">
              <span className="h-2 w-2 rounded-full bg-[#00c896]" /> Premium launchpad
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-none text-white sm:text-5xl">
              TONK.MEM
              <span className="mt-2 block bg-gradient-to-r from-[#7dd3fc] via-white to-[#00c896] bg-clip-text text-transparent">Launch fast. Trade loud.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#c4d7ef] sm:text-base">
              Премиум-мемпад на TON: запускай токены, лови ликвидность и тащи сильные штуки в маркет без дешёвого TMA вайба.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#d7e6f7] sm:text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">⚡ Telegram-native UX</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">💎 Bonding → STON.fi</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">🚀 Fast launch flow</div>
            </div>
          </div>
        </div>
      </section>
      {tickerTrades.length > 0 ? (
        <div className="overflow-hidden border-b border-[#1e3a5f] bg-[#0a1628] py-1.5">
          <div className="animate-marquee flex gap-8 whitespace-nowrap text-xs">
            {tickerTrades.concat(tickerTrades).map((trade, i) => (
              <span key={`${trade.id}-${i}`} className="flex items-center gap-1.5">
                <span className={trade.type === "buy" ? "text-[#00c896]" : "text-[#ff4757]"}>{trade.type === "buy" ? "🟢" : "🔴"}</span>
                <span className="text-[#8ba3c1]">@{trade.user}</span>
                <span className="font-bold text-white">{trade.type === "buy" ? "купил" : "продал"}</span>
                <span className="font-mono text-[#0088cc]">💎 {trade.amount} TON</span>
                <span className="text-white">{trade.tokenName}</span>
                <span className="text-[#8ba3c1]">{timeAgo(trade.timestamp)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${active === tab.key ? "bg-[#0088cc] text-white" : "bg-[#1a2235] text-[#8ba3c1]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mx-4 mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba3c1]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени или тикеру..." className="input-field pl-9" />
      </div>

      {error ? <p className="px-4 pt-4 text-sm text-[#ff4757]">{error}</p> : null}

      <div className="py-4">
        <TokenList tokens={visibleTokens} loading={loading} searchQuery={query} />
        <div ref={sentinelRef} className="h-8" />
      </div>
      </div>
    </div>
  );
}
