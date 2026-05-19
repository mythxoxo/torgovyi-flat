"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";
import { useUi } from "../components/page-shell";
import { getLaunchpadTargetTon, isTestTargetMode } from "../lib/launch-config";

export default function HomePage() {
  const { t } = useUi();
  const targetTon = getLaunchpadTargetTon();
  const testMode = isTestTargetMode();
  const tabs = [
    { key: "trending", label: t.home.trending },
    { key: "new", label: t.home.newest },
    { key: "almost-graduated", label: t.home.almost },
    { key: "graduated", label: t.home.graduated },
    { key: "top-volume", label: t.home.volume }
  ] as const;
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
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1422] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="absolute inset-0">
            <Image src="/brand/img_01.jpg" alt="TONK.MEM hero" fill className="object-cover object-center opacity-72" priority />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,20,0.18),rgba(8,12,20,0.82))]" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">
              <span className="h-2 w-2 rounded-full bg-[#7dd3fc]" /> {t.home.badge}
            </div>
            <h1 className="mt-4 max-w-[18rem] font-display text-[40px] font-black leading-[0.96] text-white sm:text-[46px]">
              {t.home.title}
            </h1>
            <p className="mt-4 max-w-[22rem] text-base font-medium leading-7 text-white/92">{t.home.subtitle}</p>
            <p className="mt-3 max-w-[24rem] text-sm leading-6 text-[#d5e1f1]">{t.home.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <div className="rounded-full border border-[#3df6a2]/25 bg-[#3df6a2]/10 px-3 py-1 text-[#9cf9cb]">Sandbox verified</div>
              <div className="rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 px-3 py-1 text-[#7dd3fc]">Manual TonConnect ready</div>
              <div className="rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 px-3 py-1 text-[#7dd3fc]">Test target: 5 TON</div>
              <div className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-white/90">Production target: 8888 TON</div>
              <div className="rounded-full border border-[#ffcc80]/30 bg-[#ffcc80]/10 px-3 py-1 text-[#ffd89b]">Mainnet proof pending</div>
            </div>
            <div className="mt-5 flex gap-3">
              <Link href="/create" className="btn-primary !rounded-2xl">{t.home.ctaPrimary}</Link>
              <Link href="/technical-status" className="rounded-2xl border border-white/14 bg-white/8 px-4 py-3 text-sm font-semibold text-white">{t.home.ctaSecondary}</Link>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] text-[#d7e6f7]">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">{t.home.statsA}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">{t.home.statsB}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">{t.home.statsC}</div>
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

      <div className="relative mx-4 mt-3 overflow-hidden rounded-[22px] border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7dd3fc]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.home.search} className="w-full bg-transparent px-11 py-4 text-sm text-white outline-none placeholder:text-[#8ba3c1]" />
      </div>

      {error ? <p className="px-4 pt-4 text-sm text-[#ff4757]">{error}</p> : null}

      <div className="py-4">
        <TokenList tokens={visibleTokens} loading={loading} searchQuery={query} />
        <section id="faq" className="mx-4 mt-6 space-y-4 rounded-[32px] border border-white/10 bg-[#0d1422]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7dd3fc]">{t.faq.title}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">{t.faq.subtitle}</h2>
          </div>
          <div className="space-y-3">
            {t.faqItems.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-sm font-semibold text-white">{item.q}</div>
                <div className="mt-2 text-sm leading-6 text-[#c6d4ea]">{item.a}</div>
              </div>
            ))}
          </div>
          <div id="rules" className="rounded-2xl border border-white/10 bg-white/4 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc]">{t.faq.rulesTitle}</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#c6d4ea]">
              {t.rules.map((rule) => <li key={rule}>• {rule}</li>)}
            </ul>
          </div>
          <div id="risks" className="rounded-2xl border border-[#ff8a80]/20 bg-[#1a1113] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#ff9d8f]">{t.faq.risksTitle}</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#f5c3bb]">
              {t.risks.map((risk) => <li key={risk}>• {risk}</li>)}
            </ul>
          </div>
        </section>
        <div ref={sentinelRef} className="h-8" />
      </div>
      </div>
    </div>
  );
}
