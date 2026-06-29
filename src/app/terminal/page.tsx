"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Flame, Search, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import type { TokenRecord } from "../../lib/shared";
import { getTokenList } from "../../lib/api";
import { ProgressBar } from "../../components/progress-bar";
import { useUi } from "../../components/page-shell";

type Filter = "hot" | "new" | "near" | "listed";

const price = (token: TokenRecord) => {
  if (token.state.currentPriceTon > 0) return token.state.currentPriceTon;
  if (token.state.soldSupply > 0 && token.state.collectedTon) return token.state.collectedTon / token.state.soldSupply;
  return 0.000001;
};

const score = (token: TokenRecord) => {
  const ageMinutes = Math.max(1, (Date.now() - new Date(token.createdAt).getTime()) / 60000);
  const collected = Number(token.state.collectedTon ?? token.state.reserveTon ?? 0);
  return (token.state.progress || 0) * 1000 + collected * 8 + Math.max(0, 240 - ageMinutes) / 4;
};

const onChain = (token: TokenRecord) => Boolean(token.contractAddresses?.bondingCurve && token.contractAddresses?.jettonMaster && !token.id.startsWith("pending:"));

export default function TerminalPage() {
  const { locale } = useUi();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("hot");

  useEffect(() => {
    let alive = true;
    const load = () => getTokenList("trending").then((rows) => { if (alive) setTokens(rows); }).finally(() => { if (alive) setLoading(false); });
    load();
    const timer = window.setInterval(load, 15000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens
      .filter((token) => !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q))
      .filter((token) => filter === "listed" ? token.status === "LISTED" : filter === "near" ? token.state.progress >= 0.5 : true)
      .sort((a, b) => filter === "new" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : score(b) - score(a));
  }, [filter, query, tokens]);

  const stats = useMemo(() => ({
    live: tokens.filter((token) => token.status === "BONDING").length,
    onchain: tokens.filter(onChain).length,
    listed: tokens.filter((token) => token.status === "LISTED").length,
    locked: tokens.reduce((sum, token) => sum + Number(token.state.collectedTon ?? token.state.reserveTon ?? 0), 0)
  }), [tokens]);

  const tabs = [
    { id: "hot" as const, label: locale === "ru" ? "Горячие" : "Hot", icon: Flame },
    { id: "new" as const, label: locale === "ru" ? "Новые" : "New", icon: Zap },
    { id: "near" as const, label: locale === "ru" ? "К выпуску" : "Near", icon: TrendingUp },
    { id: "listed" as const, label: locale === "ru" ? "На рынке" : "Listed", icon: ShieldCheck }
  ];

  return (
    <main className="space-y-5 pb-20">
      <section className="glass-card rounded-[32px] border border-white/10 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#5ac8fa]">Launch terminal</p><h1 className="mt-3 font-display text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">{locale === "ru" ? "Живая лента запусков" : "Live launch feed"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#8ba3c1]">{locale === "ru" ? "Быстрый режим для поиска, оценки и открытия рынков." : "Fast mode for discovery, risk checks and opening markets."}</p></div>
          <Link href="/create?target=8888" className="rounded-2xl bg-[#2aabee] px-5 py-3 text-center text-sm font-bold text-[#06101a]">{locale === "ru" ? "Запустить токен" : "Launch token"}</Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[{ k: "Live", v: stats.live }, { k: "On-chain", v: stats.onchain }, { k: "Listed", v: stats.listed }, { k: "GRAM locked", v: stats.locked.toFixed(2) }].map((item) => <div key={item.k} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-[#8ba3c1]">{item.k}</div><div className="mt-2 font-display text-2xl font-black text-white">{item.v}</div></div>)}
        </div>
      </section>

      <section className="glass-card sticky top-[84px] z-20 rounded-[28px] border border-white/10 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba3c1]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "ru" ? "Поиск по имени или ticker" : "Search name or ticker"} className="w-full rounded-2xl border border-white/10 bg-[#0b1325] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#5ac8fa]" /></div>
          <div className="flex gap-2 overflow-x-auto">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setFilter(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${filter === id ? "bg-[#2aabee] text-[#06101a]" : "border border-white/10 bg-white/5 text-[#c6d4ea]"}`}><Icon className="h-4 w-4" />{label}</button>)}</div>
        </div>
      </section>

      <section className="grid gap-3">
        {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[24px] bg-white/5" />) : null}
        {!loading && rows.length === 0 ? <div className="glass-card rounded-[24px] p-8 text-center text-[#8ba3c1]">{locale === "ru" ? "Ничего не найдено" : "Nothing found"}</div> : null}
        {rows.map((token, index) => { const progress = Math.round((token.state.progress || 0) * 100); const collected = Number(token.state.collectedTon ?? token.state.reserveTon ?? 0); const ready = onChain(token); return <Link key={token.id} href={`/token/${encodeURIComponent(token.id)}`} className="glass-card group grid gap-4 rounded-[24px] border border-white/10 p-4 transition hover:border-[#2aabee]/40 md:grid-cols-[64px_1fr_180px_180px] md:items-center"><div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#07111f]"><img src={token.image || "/brand/tons-of-gram-tonconnect.svg"} alt="" className="h-full w-full object-cover" loading="lazy" /><div className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">#{index + 1}</div></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-display text-xl font-black text-white">{token.name}</h2><span className="font-mono text-sm font-bold text-[#5ac8fa]">{token.ticker}</span><span className={ready ? "rounded-full bg-[#2aabee]/15 px-2 py-1 text-[10px] font-bold text-[#5ac8fa]" : "rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70"}>{ready ? "ON-CHAIN" : "PENDING"}</span></div><p className="mt-1 line-clamp-1 text-sm text-[#8ba3c1]">{token.description || (locale === "ru" ? "Без описания" : "No description")}</p></div><div><div className="flex items-center justify-between text-xs text-[#8ba3c1]"><span>{locale === "ru" ? "Прогресс" : "Progress"}</span><span>{progress}%</span></div><ProgressBar progress={progress} className="mt-2" /><div className="mt-1 text-xs text-[#8ba3c1]">{collected.toFixed(2)} GRAM locked</div></div><div className="grid grid-cols-2 gap-2 text-sm md:text-right"><div><div className="text-xs text-[#8ba3c1]">Price</div><div className="font-bold text-white">{price(token).toFixed(8)}</div></div><div className="flex items-end justify-end"><span className="rounded-2xl bg-[#2aabee] px-4 py-2 text-xs font-black text-[#06101a]">OPEN</span></div></div></Link>; })}
      </section>
    </main>
  );
}
