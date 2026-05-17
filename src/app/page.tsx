"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";

const tabs = ["Тренд", "Новые", "Почти", "Вышли", "Объём"] as const;
const heroGallery = [
  "/brand/img_02.jpg",
  "/brand/img_05.jpg",
  "/brand/img_08.jpg",
  "/brand/img_11.jpg"
] as const;

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

function formatCompactTon(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k TON`;
  return `${value.toFixed(1)} TON`;
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

  const stats = useMemo(() => {
    const totalMarketCap = filtered.reduce((sum, token) => sum + token.state.marketCapTon, 0);
    const averageProgress = filtered.length ? filtered.reduce((sum, token) => sum + token.state.progress, 0) / filtered.length : 0;
    const graduates = filtered.filter((token) => token.status === "GRADUATED").length;
    return { totalMarketCap, averageProgress, graduates };
  }, [filtered]);

  return (
    <div className="pb-20">
      <section className="px-4 pt-4">
        <div className="hero-panel overflow-hidden p-5 md:p-7">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px] xl:items-stretch">
            <div className="relative z-10 flex flex-col justify-between gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#53f6ff]/20 bg-[#53f6ff]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#9efbff]">
                  <Sparkles className="h-3.5 w-3.5" /> TONK.MEM TESTNET MARKET
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={46} height={46} className="logo-animated" />
                  <div>
                    <div className="font-display text-3xl uppercase tracking-[0.08em] text-white md:text-4xl">
                      TONK<span className="gradient-text">.MEM</span>
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.24em] text-[#3df6a2]">MEME LAUNCHPAD / TESTNET</div>
                  </div>
                </div>
                <h1 className="max-w-[11ch] font-display text-5xl leading-[0.88] tracking-[0.03em] text-[color:var(--text-primary)] md:text-7xl">
                  Рынок, где рождаются грязно красивые TON-мемы
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                  Тут не лендинг ради лендинга. Тут живой testnet launchpad: запуск, bonding curve, прогресс до graduation и рынок, который сразу выглядит как продукт для degens, а не очередной шаблон.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/create" className="btn-primary inline-flex items-center gap-2">
                  Запустить токен <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="badge bg-[#3df6a2]/10 text-[#3df6a2]">TESTNET ONLY</div>
                <div className="badge bg-white/6 text-white">NO FAKE VOLUME</div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="metric-card">
                  <div className="metric-label">TON / USD</div>
                  <div className="metric-value">{price.usd !== null ? `$${price.usd.toFixed(2)}` : "--"}</div>
                  <div className={`metric-note ${price.change !== null && price.change >= 0 ? "text-[#3df6a2]" : "text-[#ff8b3d]"}`}>
                    {price.change !== null ? `${price.change >= 0 ? "+" : ""}${price.change.toFixed(2)}% / 24h` : "waiting..."}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Market cap</div>
                  <div className="metric-value">{formatCompactTon(stats.totalMarketCap)}</div>
                  <div className="metric-note">по активной выдаче</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Heat</div>
                  <div className="metric-value">{Math.round(stats.averageProgress * 100)}%</div>
                  <div className="metric-note">средний graduation progress</div>
                </div>
              </div>
            </div>

            <div className="hero-stack relative min-h-[420px]">
              <div className="hero-stack-grid">
                <div className="hero-card hero-card-tall">
                  <Image src={heroGallery[0]} alt="TONK visual 1" fill className="object-cover" />
                </div>
                <div className="hero-card">
                  <Image src={heroGallery[1]} alt="TONK visual 2" fill className="object-cover" />
                </div>
                <div className="hero-card">
                  <Image src={heroGallery[2]} alt="TONK visual 3" fill className="object-cover" />
                </div>
                <div className="hero-card hero-card-wide">
                  <Image src={heroGallery[3]} alt="TONK visual 4" fill className="object-cover" />
                </div>
              </div>
              <div className="hero-floating hero-floating-top">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9efbff]">Graduated</div>
                <div className="mt-1 font-display text-3xl text-white">{stats.graduates}</div>
              </div>
              <div className="hero-floating hero-floating-bottom">
                <Zap className="h-4 w-4 text-[#d7ff4f]" />
                <span>Bonding pressure live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {filtered.length > 0 ? (
        <div className="ticker-strip mt-4">
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

      <section className="px-4 pt-4">
        <div className="card p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="scrollbar-none flex gap-2 overflow-x-auto">
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

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени или тикеру..." className="input-field pl-9" />
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="px-4 pt-4 text-sm text-[color:var(--red)]">{error}</p> : null}

      {filtered.length === 0 && !loading ? (
        <div className="px-4 py-16 text-center">
          <div className="hero-panel mx-auto max-w-3xl overflow-hidden p-8">
            <div className="grid items-center gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="relative mx-auto aspect-[0.9] w-full max-w-[240px] overflow-hidden rounded-[28px] border border-[#53f6ff]/16">
                <Image src="/brand/img_03.jpg" alt="Пока нет токенов" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06030a] via-transparent to-transparent" />
              </div>
              <div className="text-left">
                <h2 className="font-display text-4xl uppercase tracking-[0.06em] text-white">Пока нет токенов</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[color:var(--text-muted)]">
                  Тогда забери первый слот на витрине. Запусти монету, собери первое движение и задай тон всей ленте.
                </p>
                <Link href="/create" className="btn-primary mt-6 inline-flex items-center gap-2">
                  Запустить первый <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
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
