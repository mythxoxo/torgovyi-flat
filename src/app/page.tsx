"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";
import { getLaunchpadTargetTon } from "../lib/launch-config";
import { getTonPrice, formatTonUsd } from '../lib/market/ton-price';
import { useUi } from '../components/page-shell';

export default function HomePage() {
  const targetTon = getLaunchpadTargetTon();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [tonPrice, setTonPrice] = useState<number | null>(null);
  const { locale } = useUi();

  useEffect(() => {
    getTonPrice().then((r) => setTonPrice(r.usd)).catch(() => setTonPrice(null));
    setLoading(true);
    setError("");
    getTokenList("trending")
      .then(setTokens)
      .catch(() => setError(locale === 'ru' ? 'Индексер пока не подключён. On-chain flow остаётся manual и no-custody.' : 'Indexer is not connected yet. On-chain flow remains manual and no-custody.'))
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q));
  }, [tokens, query]);

  return (
    <div className="space-y-8 pb-20">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,26,43,0.96),rgba(8,14,25,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">TON meme launchpad</div>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-black leading-[0.95] text-white sm:text-5xl">{locale === 'ru' ? 'Запускай мем-токены на TON.' : 'Launch TON meme tokens.'}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d3dfef]">{locale === 'ru' ? 'Честный bonding, ручное подписание кошельком и DeDust после graduation.' : 'Fair bonding. Manual wallet signing. DeDust-first graduation.'}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/create" className="btn-primary text-center">Create token</Link><Link href="/technical-status" className="btn-secondary text-center text-white">Explore status</Link></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-sm"><span className="rounded-full border border-[#3df6a2]/20 bg-[#3df6a2]/10 px-3 py-2 text-[#a5fbce]">Sandbox verified</span><span className="rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-2 text-[#7dd3fc]">Manual signing</span><span className="rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-2 text-[#7dd3fc]">DeDust-first</span><span className="rounded-full border border-[#ffcc80]/20 bg-[#ffcc80]/10 px-3 py-2 text-[#ffd89b]">Mainnet proof pending</span></div>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-[#c8d5e7]">Test target: {targetTon} TON · Production target: 8888 TON {tonPrice ? `· ${formatTonUsd(targetTon, tonPrice)}` : ''}</div>
      </section>
      <section className="glass-card rounded-[28px] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Token market</p><h2 className="mt-2 font-display text-2xl font-bold text-white">{locale === 'ru' ? 'Маркет токенов' : 'Launch market'}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#c6d4ea]">{locale === 'ru' ? 'Если live данных пока нет, ниже показывается clean empty state без fake activity.' : 'If live data is not available yet, the market stays honest and shows a clean empty state.'}</p></div></div><div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/5"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === 'ru' ? 'Поиск по имени или тикеру...' : 'Search by name or ticker...'} className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-[#8ba3c1]" /></div>{error ? <div className="mt-4 rounded-2xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-3 text-sm text-[#c6e8ff]">{error}</div> : null}<div className="mt-4"><TokenList tokens={filtered} loading={loading} searchQuery={query} /></div></section>
    </div>
  );
}
