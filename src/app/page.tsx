"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";

const tabs = ["Тренд", "Новые", "Почти", "Вышли", "Объём"] as const;

function mapTabToFilter(tab: (typeof tabs)[number]) {
  switch (tab) {
    case "Новые":
      return "new";
    case "Почти":
      return "almost-graduated";
    case "Вышли":
      return "graduated";
    case "Объём":
      return "top-volume";
    default:
      return "trending";
  }
}

function useTonPrice() {
  const [price, setPrice] = useState<{ usd: number | null; change: number | null }>({ usd: null, change: null });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd&include_24hr_change=true"
        );
        const json = await res.json();
        if (!alive) return;
        setPrice({
          usd: json["the-open-network"]?.usd ?? null,
          change: json["the-open-network"]?.usd_24h_change ?? null
        });
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return price;
}

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [active, setActive] = useState<(typeof tabs)[number]>("Тренд");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const price = useTonPrice();

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList(mapTabToFilter(active))
      .then(setTokens)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Не удалось загрузить токены"))
      .finally(() => setLoading(false));
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q));
  }, [tokens, query]);

  return (
    <div className="pb-20">
      <section className="px-4 pt-4">
        <div className="card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-3">
                <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={42} height={42} className="logo-animated" />
                <div>
                  <div className="font-display text-3xl uppercase tracking-[0.08em] text-white md:text-4xl">
                    TONK<span className="gradient-text">.MEM</span>
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.24em] text-[#3df6a2]">TESTNET</div>
                </div>
              </div>
              <h1 className="max-w-[11ch] font-display text-4xl leading-[0.9] tracking-[0.04em] text-[color:var(--text-primary)] md:text-6xl">
                Запускай мем-токены на TON
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--text-muted)]">
                Быстрый testnet-маркет для degen-комьюнити: токены, bonding progress и живой TON-пульс без выдуманных цифр.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/create" className="btn-primary inline-flex">
                  Запустить токен
                </Link>
                <div className="badge bg-[#3df6a2]/10 text-[#3df6a2]">TESTNET</div>
              </div>
            </div>
            <div className="card min-w-[180px] p-4 text-right">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">TON / USD</div>
              <div className="mt-2 font-mono text-2xl font-bold text-white">
                {price.usd !== null ? `$${price.usd.toFixed(2)}` : "--"}
              </div>
              <div className={`mt-1 text-sm ${price.change !== null && price.change >= 0 ? "text-[#3df6a2]" : "text-[#ff8b3d]"}`}>
                {price.change !== null ? `${price.change >= 0 ? "+" : ""}${price.change.toFixed(2)}%` : "waiting..."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {filtered.length > 0 ? (
        <div className="mt-4 overflow-hidden border-y border-[color:var(--border)] bg-[color:var(--surface)] py-1.5">
          <div className="animate-marquee flex gap-8 whitespace-nowrap text-xs">
            {filtered.concat(filtered).slice(0, Math.max(10, filtered.length * 2)).map((token, i) => (
              <span key={`${token.id}-${i}`} className="flex items-center gap-2 text-[color:var(--text-muted)]">
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
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
              active === tab
                ? "border-[#53f6ff]/30 bg-[#53f6ff]/10 text-white shadow-neon"
                : "border-transparent bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative mx-4 mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени или тикеру..." className="input-field pl-9" />
      </div>

      {error ? <p className="px-4 pt-4 text-sm text-[color:var(--red)]">{error}</p> : null}

      {filtered.length === 0 && !loading ? (
        <div className="px-4 py-16 text-center">
          <div className="card mx-auto max-w-md p-8">
            <Image src="/brand/img_03.jpg" alt="Пока нет токенов" width={120} height={120} className="mx-auto rounded-2xl opacity-85" />
            <h2 className="mt-5 font-display text-3xl uppercase tracking-[0.06em] text-white">Пока нет токенов</h2>
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">Стань первым и открой рынок для нового TON-мема.</p>
            <Link href="/create" className="btn-primary mt-5 inline-flex">
              Запустить первый
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4">
          <TokenList tokens={filtered} loading={loading} />
        </div>
      )}
    </div>
  );
}
