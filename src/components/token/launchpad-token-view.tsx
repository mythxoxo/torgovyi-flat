"use client";

import Image from "next/image";
import { Copy, Send } from "lucide-react";
import type { TokenRecord, TradeRecord } from "../../lib/shared";
import { BuySellBox } from "../buy-sell-box";
import { TokenPriceChart } from "../token-price-chart";
import { TradeFeed } from "../trade-feed";
import { ProgressBar } from "../progress-bar";
import { getTelegramWebApp } from "../../lib/telegram";
import { useUi } from "../page-shell";

export function LaunchpadTokenView({ token, trades }: { token: TokenRecord; trades: TradeRecord[] }) {
  const { locale } = useUi();
  const app = getTelegramWebApp();
  const progress = Math.round(token.state.progress * 100);
  const shareToTelegram = () => app?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🚀 ${token.name} (${token.ticker}) on TONS of GRAM`)}`);
  const copyAddress = async () => navigator.clipboard.writeText(token.id);

  return (
    <div className="space-y-5 pb-24 pt-2">
      <section className="pd-panel overflow-hidden rounded-[34px] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={80} height={80} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="pd-chip pd-chip-hot">Launchpad</span>
                <span className="pd-chip pd-chip-blue">{token.status}</span>
                <span className="pd-chip pd-chip-live">{progress}%</span>
              </div>
              <h1 className="mt-4 truncate font-display text-5xl font-black tracking-[-0.065em] text-white">{token.name}</h1>
              <div className="mt-1 font-mono text-sm font-bold text-[#5ac8fa]">{token.ticker}</div>
            </div>
          </div>
          <button onClick={shareToTelegram} className="pd-btn-secondary w-auto"><Send className="h-4 w-4" /> {locale === "ru" ? "Поделиться" : "Share"}</button>
        </div>

        {token.description ? <p className="mt-5 max-w-3xl text-sm leading-7 text-[#90a3b8]">{token.description}</p> : null}

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-[#90a3b8]">{token.id.slice(0, 6)}...{token.id.slice(-4)}</span>
          <button onClick={copyAddress}><Copy className="h-4 w-4 text-[#90a3b8]" /></button>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <div className="flex justify-between text-sm"><span className="text-[#90a3b8]">{locale === "ru" ? "Прогресс до листинга" : "Progress to graduation"}</span><span className="font-mono font-black text-[#9cff2e]">{progress}%</span></div>
          <ProgressBar progress={progress} />
          <div className="mt-2 flex justify-between text-xs text-[#90a3b8]"><span>{(token.state.collectedTon ?? token.state.reserveTon).toFixed(2)} GRAM</span><span>target: {(token.state.targetTon ?? 8888).toLocaleString("en-US")} GRAM</span></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <TokenPriceChart trades={trades} />
        <BuySellBox token={token} />
      </div>
      <TradeFeed trades={trades} />
    </div>
  );
}
