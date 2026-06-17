"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Flame, Gauge, Layers3, Rocket, ShieldCheck, Sparkles, Wallet } from "lucide-react";
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
    <div className="space-y-5 pb-20 xl:space-y-7">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="gram-hero rounded-[34px] p-5 sm:p-7 xl:p-8">
          <div className="gram-orb" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#20d8ff]/18 bg-[#20d8ff]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#9eeeff]">
                <Sparkles className="h-3.5 w-3.5" />
                {locale === "ru" ? "launch control" : "launch control"}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-xs font-bold text-[#9aacc2]">
                {locale === "ru" ? "wallet-first" : "wallet-first"}
              </div>
            </div>

            <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div>
                <h1 className="max-w-3xl font-display text-[2.35rem] font-black leading-[0.94] text-white sm:text-5xl xl:text-[4.4rem]">
                  {t.home.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#afc0d4] sm:text-lg">{t.home.subtitle}</p>
              </div>

              <div className="rounded-[28px] border border-[#20d8ff]/14 bg-[#030914]/62 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#7890aa]">{locale === "ru" ? "модель" : "model"}</div>
                    <div className="mt-1 text-2xl font-black text-white">5 / 8888</div>
                  </div>
                  <div className="rounded-2xl bg-[#0098ea]/14 p-3 text-[#20d8ff]">
                    <Gauge className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#10233c]">
                  <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-[#20d8ff] via-[#0098ea] to-[#006bff]" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#7890aa]"><span>test</span><span>main</span></div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Link href="/create?target=5" className="group rounded-[26px] border border-[#20d8ff]/18 bg-[#20d8ff]/10 p-4 transition hover:-translate-y-0.5 hover:border-[#20d8ff]/38 hover:bg-[#20d8ff]/14">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-[#0098ea] p-3 text-white shadow-[0_14px_34px_rgba(0,152,234,0.28)]"><Rocket className="h-5 w-5" /></div>
                  <ArrowRight className="h-4 w-4 text-[#20d8ff] opacity-70 transition group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4 text-lg font-black text-white">{t.home.launchTest}</div>
                <div className="mt-1 text-sm leading-5 text-[#8ea4bb]">{locale === "ru" ? "проверка механики" : "mechanics check"}</div>
              </Link>

              <Link href="/create?target=8888" className="group rounded-[26px] border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-[#20d8ff]/30 hover:bg-[#20d8ff]/8">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-white/8 p-3 text-[#20d8ff]"><Layers3 className="h-5 w-5" /></div>
                  <ArrowRight className="h-4 w-4 text-[#20d8ff] opacity-70 transition group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4 text-lg font-black text-white">{t.home.launchMain}</div>
                <div className="mt-1 text-sm leading-5 text-[#8ea4bb]">{locale === "ru" ? "основной запуск" : "main launch"}</div>
              </Link>

              <Link href="/markets" className="group rounded-[26px] border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-[#20d8ff]/30 hover:bg-[#20d8ff]/8">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-white/8 p-3 text-[#20d8ff]"><Flame className="h-5 w-5" /></div>
                  <ArrowRight className="h-4 w-4 text-[#20d8ff] opacity-70 transition group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4 text-lg font-black text-white">{t.home.ctaTokens}</div>
                <div className="mt-1 text-sm leading-5 text-[#8ea4bb]">{locale === "ru" ? "рынки и лента" : "markets and feed"}</div>
              </Link>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="glass-card rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#7890aa]">{locale === "ru" ? "security" : "security"}</div>
                <div className="mt-2 text-2xl font-black text-white">No custody</div>
              </div>
              <div className="rounded-2xl bg-[#20d8ff]/10 p-3 text-[#20d8ff]"><ShieldCheck className="h-6 w-6" /></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#9fb1c8]">{locale === "ru" ? "Запуск и покупка идут через кошелёк. Backend не держит TON/GRAM пользователя." : "Launch and buy flows stay wallet-signed. Backend does not custody user funds."}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-[24px] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[#7890aa]">{locale === "ru" ? "лента" : "feed"}</div>
              <div className="mt-2 text-3xl font-black text-white">{statLaunches}</div>
              <div className="mt-1 text-xs text-[#8ea4bb]">{locale === "ru" ? "запусков" : "launches"}</div>
            </div>
            <div className="glass-card rounded-[24px] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[#7890aa]">network</div>
              <div className="mt-2 text-3xl font-black text-[#20d8ff]">GRAM</div>
              <div className="mt-1 text-xs text-[#8ea4bb]">mainnet</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="gram-chip justify-center"><Wallet className="h-4 w-4" /> Wallet</div>
            <div className="gram-chip justify-center"><BadgeCheck className="h-4 w-4" /> On-chain</div>
          </div>
        </aside>
      </section>

      <section className="glass-card rounded-[30px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#20d8ff]">{locale === "ru" ? "живой launchpad" : "live launchpad"}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">{t.home.launchesTitle}</h2>
          </div>
          <Link href="/markets" className="hidden rounded-2xl border border-[#20d8ff]/18 bg-[#20d8ff]/8 px-4 py-2 text-sm font-bold text-[#b9efff] transition hover:bg-[#20d8ff]/12 sm:inline-flex">
            {locale === "ru" ? "Все рынки" : "View markets"}
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
