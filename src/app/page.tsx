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
        <Image src="/brand/img_01.png" alt="" fill className="object-cover opacity-[0.05]" priority />
      </div>
      <div className="relative z-10">
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
