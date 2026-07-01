"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getBlumMemepadTokens, getTokenList } from "../lib/api";
import { useUi } from "../components/page-shell";

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [blumTokens, setBlumTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [blumLoading, setBlumLoading] = useState(true);
  const [error, setError] = useState("");
  const [blumNotice, setBlumNotice] = useState("");
  const { t, locale } = useUi();

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList("trending")
      .then(setTokens)
      .catch(() => setError(""))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setBlumLoading(true);
    setBlumNotice("");
    getBlumMemepadTokens(6)
      .then((feed) => {
        setBlumTokens(feed.tokens);
        if (feed.warning) setBlumNotice(feed.warning);
        if (!feed.configured) {
          setBlumNotice(
            locale === "ru"
              ? "Blum Memepad feed пока не настроен: добавь BLUM_MEMEPAD_FEED_URL или BLUM_MEMEPAD_JETTONS в env."
              : "Blum Memepad feed is not configured yet: add BLUM_MEMEPAD_FEED_URL or BLUM_MEMEPAD_JETTONS to env."
          );
        }
      })
      .catch((err) => setBlumNotice(err instanceof Error ? err.message : "Blum feed unavailable"))
      .finally(() => setBlumLoading(false));
  }, [locale]);

  const launches = useMemo(() => tokens.slice(0, 6), [tokens]);
  const blumLaunches = useMemo(() => blumTokens.slice(0, 6), [blumTokens]);

  return (
    <div className="space-y-8 pb-20">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,26,43,0.96),rgba(8,14,25,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="max-w-4xl">
          <h1 className="mt-1 max-w-3xl font-display text-4xl font-black leading-[0.95] text-white sm:text-5xl">
            {t.home.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d3dfef]">{t.home.subtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/create?target=5" className="btn-primary text-center">{t.home.launchTest}</Link>
            <Link href="/create?target=8888" className="btn-secondary text-center text-white">{t.home.launchMain}</Link>
            <Link href="/markets" className="btn-secondary text-center text-white">{t.home.ctaTokens}</Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">{t.home.modeTest}</div>
            <div className="mt-2 text-sm text-[#c6d4ea]">{t.home.note}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">{t.home.modeMain}</div>
            <div className="mt-2 text-sm text-[#c6d4ea]">{t.home.note}</div>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[28px] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Launchpad feed" : "Launchpad feed"}</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{t.home.launchesTitle}</h2>
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#c6e8ff]">{t.misc.noLaunches}</div> : null}
        <div className="mt-4">
          <TokenList tokens={launches} loading={loading} />
        </div>
      </section>

      <section className="glass-card rounded-[28px] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Blum Memepad</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              {locale === "ru" ? "Новые монеты из Blum" : "New coins from Blum"}
            </h2>
          </div>
          <a href="/api/external/blum" target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#7dd3fc] hover:text-white">
            {locale === "ru" ? "Открыть JSON" : "Open JSON"}
          </a>
        </div>
        {blumNotice ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[#c6e8ff]">
            {blumNotice}
          </div>
        ) : null}
        <div className="mt-4">
          <TokenList tokens={blumLaunches} loading={blumLoading} />
        </div>
      </section>
    </div>
  );
}
