"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Flame, Layers3, Rocket, ShieldCheck, Wallet } from "lucide-react";
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
  const statLaunches = launches.length || 0;

  return (
    <div className="space-y-6 pb-20 xl:space-y-8">
      <section className="gram-hero rounded-[32px] p-5 sm:p-8 xl:p-10">
        <div className="gram-orb" />
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#20d8ff]/20 bg-[#20d8ff]/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8feaff]">
              <Rocket className="h-3.5 w-3.5" />
              {locale === "ru" ? "GRAM launchpad" : "GRAM launchpad"}
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-[2.8rem] font-black leading-[0.9] text-white sm:text-6xl xl:text-7xl">
              {t.home.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#bed2e9] sm:text-lg">{t.home.subtitle}</p>

            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/create?target=5" className="btn-primary inline-flex items-center justify-center gap-2 text-center">
                <Rocket className="h-4 w-4" />
                {t.home.launchTest}
              </Link>
              <Link href="/create?target=8888" className="btn-secondary inline-flex items-center justify-center gap-2 text-center text-white">
                <Layers3 className="h-4 w-4" />
                {t.home.launchMain}
              </Link>
              <Link href="/markets" className="btn-secondary inline-flex items-center justify-center gap-2 text-center text-white">
                {t.home.ctaTokens}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#20d8ff]/16 bg-[#040b16]/72 p-4 shadow-[0_26px_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#7f93ab]">{locale === "ru" ? "Режим запуска" : "Launch modes"}</div>
                <div className="mt-1 text-xl font-black text-white">5 / 8888 GRAM</div>
              </div>
              <div className="rounded-2xl bg-[#0098ea]/15 p-3 text-[#20d8ff]">
                <Flame className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <Link href="/create?target=5" className="group rounded-[22px] border border-[#20d8ff]/14 bg-white/[0.045] p-4 transition hover:border-[#20d8ff]/32 hover:bg-[#20d8ff]/8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-white">{t.home.modeTest}</div>
                    <div className="mt-1 text-xs leading-5 text-[#8ea4bb]">{locale === "ru" ? "Быстрая проверка механики" : "Fast mechanics check"}</div>
                  </div>
                  <div className="text-lg font-black text-[#20d8ff]">5</div>
                </div>
              </Link>
              <Link href="/create?target=8888" className="group rounded-[22px] border border-[#20d8ff]/14 bg-white/[0.045] p-4 transition hover:border-[#20d8ff]/32 hover:bg-[#20d8ff]/8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-white">{t.home.modeMain}</div>
                    <div className="mt-1 text-xs leading-5 text-[#8ea4bb]">{locale === "ru" ? "Основная модель launchpad" : "Main launchpad model"}</div>
                  </div>
                  <div className="text-lg font-black text-[#20d8ff]">8888</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="gram-chip justify-center"><ShieldCheck className="h-4 w-4" /> No custody</div>
          <div className="gram-chip justify-center"><Wallet className="h-4 w-4" /> Wallet-first</div>
          <div className="gram-chip justify-center"><BadgeCheck className="h-4 w-4" /> On-chain</div>
          <div className="gram-chip justify-center"><Layers3 className="h-4 w-4" /> GRAM native</div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="glass-card rounded-[24px] p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-[#7f93ab]">{locale === "ru" ? "Последние" : "Latest"}</div>
          <div className="mt-2 text-3xl font-black text-white">{statLaunches}</div>
          <div className="mt-1 text-sm text-[#8ea4bb]">{locale === "ru" ? "запусков в ленте" : "launches in feed"}</div>
        </div>
        <div className="glass-card rounded-[24px] p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-[#7f93ab]">{locale === "ru" ? "Сеть" : "Network"}</div>
          <div className="mt-2 text-3xl font-black text-[#20d8ff]">GRAM</div>
          <div className="mt-1 text-sm text-[#8ea4bb]">{locale === "ru" ? "mainnet flow" : "mainnet flow"}</div>
        </div>
        <div className="glass-card rounded-[24px] p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-[#7f93ab]">{locale === "ru" ? "Подпись" : "Signing"}</div>
          <div className="mt-2 text-3xl font-black text-white">Wallet</div>
          <div className="mt-1 text-sm text-[#8ea4bb]">{locale === "ru" ? "без custody" : "no custody"}</div>
        </div>
      </section>

      <section className="glass-card rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#20d8ff]">{locale === "ru" ? "живая лента" : "live feed"}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">{t.home.launchesTitle}</h2>
          </div>
          <Link href="/markets" className="hidden rounded-2xl border border-[#20d8ff]/18 bg-[#20d8ff]/8 px-4 py-2 text-sm font-bold text-[#b9efff] transition hover:bg-[#20d8ff]/12 sm:inline-flex">
            {locale === "ru" ? "Все" : "View all"}
          </Link>
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#c6e8ff]">{t.misc.noLaunches}</div> : null}
        <div className="mt-4">
          <TokenList tokens={launches} loading={loading} />
        </div>
      </section>
    </div>
  );
}
