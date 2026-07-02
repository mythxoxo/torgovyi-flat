"use client";

import Link from "next/link";
import { BarChart3, Rocket, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";
import { useUi } from "../components/page-shell";

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, locale } = useUi();

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList("trending")
      .then(setTokens)
      .catch(() => setError(""))
      .finally(() => setLoading(false));
  }, []);

  const launches = useMemo(() => tokens.slice(0, 6), [tokens]);
  const totalCollected = launches.reduce((sum, token) => sum + (token.state.collectedTon ?? token.state.reserveTon ?? 0), 0);
  const liveCount = launches.length;

  return (
    <div className="space-y-7 pb-20">
      <section className="pd-panel overflow-hidden rounded-[36px]">
        <div className="grid gap-0 xl:grid-cols-[1fr_390px]">
          <div className="relative overflow-hidden p-7 sm:p-10">
            <div className="absolute left-[-110px] top-[-140px] h-80 w-80 rounded-full bg-[#ff3d9a]/16 blur-3xl" />
            <div className="absolute bottom-[-140px] right-[-100px] h-96 w-96 rounded-full bg-[#2aabee]/16 blur-3xl" />
            <div className="relative z-10 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pd-chip pd-chip-hot"><Sparkles className="h-3.5 w-3.5" /> GRAM launchpad</span>
                <span className="pd-chip pd-chip-blue">Market status</span>
                <span className="pd-chip pd-chip-live">No custody</span>
              </div>

              <h1 className="mt-7 max-w-4xl font-display text-[3rem] font-black leading-[0.92] tracking-[-0.065em] text-white sm:text-[4.9rem]">
                {t.home.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#cbd5e1]">{t.home.subtitle}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/create?target=8888" className="pd-btn-primary"><Rocket className="h-4 w-4" /> {t.home.launchMain}</Link>
                <Link href="/markets" className="pd-btn-secondary"><BarChart3 className="h-4 w-4" /> {t.home.ctaTokens}</Link>
              </div>

              <div className="mt-9 grid gap-3 md:grid-cols-3">
                <div className="pd-stat"><ShieldCheck className="h-5 w-5 text-[#9cff2e]" /><div className="mt-3 text-sm font-black text-white">No custody</div><div className="mt-1 text-sm leading-5 text-[#90a3b8]">{locale === "ru" ? "Подпись только в кошельке." : "Wallet-only signing."}</div></div>
                <div className="pd-stat"><TrendingUp className="h-5 w-5 text-[#ff7fc3]" /><div className="mt-3 text-sm font-black text-white">Market layer</div><div className="mt-1 text-sm leading-5 text-[#90a3b8]">{locale === "ru" ? "Метрики из live pipeline." : "Metrics from live pipeline."}</div></div>
                <div className="pd-stat"><Wallet className="h-5 w-5 text-[#5ac8fa]" /><div className="mt-3 text-sm font-black text-white">8888 GRAM</div><div className="mt-1 text-sm leading-5 text-[#90a3b8]">{locale === "ru" ? "Публичный target." : "Public target."}</div></div>
              </div>
            </div>
          </div>

          <aside className="border-t border-white/10 bg-black/24 p-6 xl:border-l xl:border-t-0">
            <p className="pd-kicker">Launch control</p>
            <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between gap-3"><span className="text-sm font-black text-white">{t.home.modeMain}</span><span className="pd-chip pd-chip-live">Open</span></div>
              <div className="mt-4 text-5xl font-black tracking-[-0.06em] text-white">8888</div>
              <div className="mt-1 text-sm text-[#90a3b8]">GRAM target</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="pd-stat"><div className="text-xs text-[#90a3b8]">{locale === "ru" ? "В фиде" : "In feed"}</div><div className="mt-2 text-3xl font-black text-white">{liveCount}</div></div>
              <div className="pd-stat"><div className="text-xs text-[#90a3b8]">{locale === "ru" ? "Собрано" : "Raised"}</div><div className="mt-2 text-3xl font-black text-[#9cff2e]">{totalCollected.toFixed(0)}</div></div>
            </div>
            <div className="mt-3 rounded-[28px] border border-[#ff3d9a]/20 bg-[#ff3d9a]/8 p-5">
              <div className="text-sm font-black text-white">{locale === "ru" ? "Premium degen" : "Premium degen"}</div>
              <p className="mt-2 text-sm leading-6 text-[#cbd5e1]">{locale === "ru" ? "Degen-энергия без дешёвого казино-визуала: чистая сетка, мягкий glow, понятные действия." : "Degen energy without casino visuals: clean grid, soft glow, clear actions."}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="pd-panel rounded-[32px] p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="pd-kicker">Launchpad feed</p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.05em] text-white">{t.home.launchesTitle}</h2>
            <p className="mt-2 text-sm text-[#90a3b8]">{locale === "ru" ? "Следи за тем, что уже запущено, что движется и что ещё ждёт proof." : "Track what launched, what is moving, and what still needs proof."}</p>
          </div>
          <Link href="/markets" className="pd-btn-secondary w-auto">{locale === "ru" ? "Все рынки" : "All markets"}</Link>
        </div>
        {error ? <div className="pd-empty mt-4 rounded-2xl px-4 py-3 text-sm text-[#ffb3d1]">{t.misc.noLaunches}</div> : null}
        <div className="mt-5"><TokenList tokens={launches} loading={loading} /></div>
      </section>
    </div>
  );
}
