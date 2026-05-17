"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";

const tabs = ["Тренд", "Новые", "~Grad", "Вышли", "Топ кап"] as const;

function mapTabToFilter(tab: (typeof tabs)[number]) {
  switch (tab) {
    case "Новые": return "new";
    case "~Grad": return "almost-graduated";
    case "Вышли": return "graduated";
    case "Топ кап": return "top-volume";
    default: return "trending";
  }
}

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [active, setActive] = useState<(typeof tabs)[number]>("Тренд");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList(mapTabToFilter(active)).then(setTokens).catch((err: unknown) => setError(err instanceof Error ? err.message : "Не удалось загрузить токены")).finally(() => setLoading(false));
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q));
  }, [tokens, query]);

  return (
    <div className="pb-20">
      <section className="px-4 pt-4">
        <div className="card relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,70,199,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(83,246,255,0.10),transparent_28%)]" />
          <div className="relative z-10">
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="badge bg-[#53f6ff]/10 text-[#53f6ff]">TON Launchpad</span>
              <span className="badge bg-[#3df6a2]/10 text-[#3df6a2]">Testnet</span>
            </div>
            <h1 className="max-w-[11ch] font-display text-5xl leading-[0.92] tracking-[0.05em] text-[color:var(--text-primary)]">MINT MEMES. FARM EXITS.</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--text-muted)]">TONK.MEM — деgen launchpad для Telegram. Быстрый запуск, честный bonding progress, testnet-only flow и ноль картонного SaaS вайба.</p>
            <div className="mt-5"><Link href="/create" className="btn-primary inline-flex">Запустить токен</Link></div>
          </div>
        </div>
      </section>

      {filtered.length > 0 ? (
        <div className="mt-4 overflow-hidden border-y border-[color:var(--border)] bg-[color:var(--surface)] py-1.5">
          <div className="animate-marquee flex gap-8 whitespace-nowrap text-xs">
            {filtered.concat(filtered).slice(0, Math.max(10, filtered.length * 2)).map((token, i) => (
              <span key={`${token.id}-${i}`} className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <span className="font-semibold text-[color:var(--text-primary)]">{token.name}</span>
                <span className="font-mono text-[#53f6ff]">${token.ticker}</span>
                <span>{Math.round(token.state.progress * 100)}% grad</span>
                <span className="font-mono text-[#d7ff4f]">{token.state.marketCapTon.toFixed(1)} TON</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActive(tab)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${active === tab ? "border-[#53f6ff]/30 bg-[#53f6ff]/10 text-white shadow-neon" : "border-transparent bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-white"}`}>{tab}</button>
        ))}
      </div>

      <div className="relative mx-4 mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени или тикеру..." className="input-field pl-9" />
      </div>

      {error ? <p className="px-4 pt-4 text-sm text-[color:var(--red)]">{error}</p> : null}
      <div className="px-6 py-4"><TokenList tokens={filtered} loading={loading} /></div>
    </div>
  );
}
