"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";

const tabs = ["Trending", "New", "Almost Grad", "Graduated", "Top Volume"] as const;

function mapTabToFilter(tab: (typeof tabs)[number]) {
  switch (tab) {
    case "New":
      return "new";
    case "Almost Grad":
      return "almost-graduated";
    case "Graduated":
      return "graduated";
    case "Top Volume":
      return "top-volume";
    default:
      return "trending";
  }
}

function statusFromToken(token: TokenRecord) {
  if (token.status === "GRADUATED") return "Graduated";
  if (token.state.progress >= 0.75) return "Almost Grad";
  if ((Date.now() - new Date(token.createdAt).getTime()) / 60000 < 60) return "New";
  return "Trending";
}

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [active, setActive] = useState<(typeof tabs)[number]>("Trending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList(mapTabToFilter(active))
      .then(setTokens)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load tokens"))
      .finally(() => setLoading(false));
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => {
      const matchesQuery = !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q);
      const matchesTab = active === "Top Volume" || statusFromToken(token) === active || (active === "Trending" && statusFromToken(token) !== "Graduated");
      return matchesQuery && matchesTab;
    });
  }, [tokens, query, active]);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden px-4 pt-4">
        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,136,204,0.18),_transparent_45%)]" />
          <div className="relative grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#8ba3c1]">Launch. Meme. Earn.</p>
              <h1 className="mt-3 max-w-[10ch] font-display text-4xl font-bold text-white">TONK<span className="gradient-text">.MEM</span></h1>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#8ba3c1]">Telegram-native TON meme launchpad for fast testnet launches, live bonding progress, and instant wallet flow.</p>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-[28px] border border-[#1e3a5f]">
              <Image src="/brand/img_01.jpg" alt="TONK.MEM hero art" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 overflow-hidden border-y border-[#1e3a5f] bg-[#0a1628] py-1.5">
        <div className="animate-marquee flex gap-8 whitespace-nowrap text-xs">
          {tokens.concat(tokens).slice(0, Math.max(10, tokens.length * 2)).map((token, i) => (
            <span key={`${token.id}-${i}`} className="flex items-center gap-1.5">
              <span className={i % 2 === 0 ? "text-[#00c896]" : "text-[#ff4757]"}>{i % 2 === 0 ? "🟢" : "🔴"}</span>
              <span className="text-[#8ba3c1]">@{token.creatorTelegramId || "creator"}</span>
              <span className="font-bold text-white">{i % 2 === 0 ? "купил" : "продал"}</span>
              <span className="font-mono text-[#0088cc]">💎 {token.state.volumeTon.toFixed(2)} TON</span>
              <span className="text-[#8ba3c1]">·</span>
              <span className="text-white">{token.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${active === tab ? "bg-[#0088cc] text-white" : "bg-[#1a2235] text-[#8ba3c1] hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative mx-4 mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba3c1]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени или тикеру..."
          className="w-full rounded-xl border border-[#1e3a5f] bg-[#1a2235] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-[#8ba3c1] focus:border-[#0088cc] focus:outline-none transition-colors"
        />
      </div>

      {error ? <p className="px-4 pt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="px-6 py-4">
        <TokenList tokens={filtered} loading={loading} />
      </div>
    </div>
  );
}
