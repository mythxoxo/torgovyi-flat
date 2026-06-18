"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";
import { useUi } from "../components/page-shell";

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, locale, theme } = useUi();

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList("trending")
      .then(setTokens)
      .catch(() => setError(""))
      .finally(() => setLoading(false));
  }, []);

  const launches = useMemo(() => tokens.slice(0, 6), [tokens]);
  const panel = theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827] shadow-[0_24px_70px_rgba(15,23,42,0.08)]" : "border-white/10 bg-[#0f1724] text-white shadow-[0_24px_70px_rgba(0,0,0,0.26)]";
  const muted = theme === "light" ? "text-[#64748b]" : "text-[#8ba3c1]";
  const soft = theme === "light" ? "border-[#dbe8f4] bg-[#f8fbff]" : "border-white/10 bg-white/5";

  return (
    <div className="space-y-8 pb-20">
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className={`rounded-[36px] border p-7 sm:p-9 ${panel}`}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0088cc]">TONS OF GRAM</p>
          <h1 className="mt-5 max-w-4xl font-display text-[3.2rem] font-black leading-[0.92] tracking-[-0.055em] sm:text-[4.6rem]">
            {t.home.title}
          </h1>
          <p className={`mt-5 max-w-2xl text-lg leading-8 ${muted}`}>{t.home.subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/create?target=8888" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0088cc] px-6 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_16px_36px_rgba(0,136,204,0.22)]">
              {t.home.launchMain}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/markets" className={`inline-flex items-center justify-center rounded-2xl border px-6 py-3.5 text-[15px] font-semibold tracking-[-0.01em] ${theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827]" : "border-white/10 bg-white/5 text-white"}`}>
              {t.home.ctaTokens}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className={`rounded-3xl border p-4 ${soft}`}>
              <ShieldCheck className="h-5 w-5 text-[#0088cc]" />
              <div className="mt-3 text-sm font-semibold">No custody</div>
              <div className={`mt-1 text-sm leading-5 ${muted}`}>{locale === "ru" ? "Кошелёк подписывает всё вручную." : "Wallet signs every action."}</div>
            </div>
            <div className={`rounded-3xl border p-4 ${soft}`}>
              <TrendingUp className="h-5 w-5 text-[#0088cc]" />
              <div className="mt-3 text-sm font-semibold">Market first</div>
              <div className={`mt-1 text-sm leading-5 ${muted}`}>{locale === "ru" ? "Рынок решает, что живёт." : "The market decides what lives."}</div>
            </div>
            <div className={`rounded-3xl border p-4 ${soft}`}>
              <Wallet className="h-5 w-5 text-[#0088cc]" />
              <div className="mt-3 text-sm font-semibold">8888 GRAM</div>
              <div className={`mt-1 text-sm leading-5 ${muted}`}>{locale === "ru" ? "Публичный запуск." : "Public launch."}</div>
            </div>
          </div>
        </div>

        <aside className={`rounded-[32px] border p-6 ${panel}`}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088cc]">Launch control</p>
          <div className="mt-5 rounded-3xl border border-[var(--gram-border)] bg-[var(--gram-soft)] p-5">
            <div className="text-sm font-semibold">{t.home.modeMain}</div>
            <div className="mt-2 text-4xl font-black tracking-[-0.04em]">8888</div>
            <div className={`mt-1 text-sm ${muted}`}>GRAM</div>
          </div>
          <div className="mt-3 rounded-3xl border border-[var(--gram-border)] bg-[var(--gram-soft)] p-5">
            <div className="text-sm font-semibold">{t.home.modeTest}</div>
            <div className={`mt-2 text-sm leading-6 ${muted}`}>{locale === "ru" ? "5 GRAM скрыт как внутренний тест, не как публичный CTA." : "5 GRAM stays hidden as internal test, not public CTA."}</div>
          </div>
          <Link href="/create?target=8888" className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#0088cc] px-5 py-3 text-sm font-semibold text-white">
            {locale === "ru" ? "Подготовить запуск" : "Prepare launch"}
          </Link>
        </aside>
      </section>

      <section className={`rounded-[32px] border p-6 ${panel}`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088cc]">Launchpad feed</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em]">{t.home.launchesTitle}</h2>
          </div>
          <Link href="/markets" className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${theme === "light" ? "border-[#dbe8f4] bg-white text-[#111827]" : "border-white/10 bg-white/5 text-white"}`}>
            {locale === "ru" ? "Все рынки" : "All markets"}
          </Link>
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-[var(--gram-border)] bg-[var(--gram-soft)] px-4 py-3 text-sm text-[var(--gram-muted)]">{t.misc.noLaunches}</div> : null}
        <div className="mt-5">
          <TokenList tokens={launches} loading={loading} />
        </div>
      </section>
    </div>
  );
}
