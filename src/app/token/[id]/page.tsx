"use client";

import Image from "next/image";
import { Copy, Globe, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { TokenRecord, TradeRecord } from "../../../lib/shared";
import { BuySellBox } from "../../../components/buy-sell-box";
import { ChartPlaceholder } from "../../../components/chart-placeholder";
import { LiveTrades } from "../../../components/live-trades";
import { ProgressBar } from "../../../components/progress-bar";
import { getToken, getTrades } from "../../../lib/api";
import { getTelegramWebApp } from "../../../lib/telegram";

function StatusBadge({ token }: { token: TokenRecord }) {
  const progress = Math.round(token.state.progress * 100);
  if (token.status === "LISTED") return <span className="badge bg-white/10 text-white">✅ Listed</span>;
  if (token.status === "GRADUATED_READY") return <span className="badge bg-[#00c896]/20 text-[#00c896]">🎓 Graduated</span>;
  if (progress >= 75) return <span className="badge bg-[#00c896]/20 text-[#00c896]">💎 Почти</span>;
  if (progress >= 40) return <span className="badge bg-[#0088cc]/20 text-[#0088cc]">🔥 Тренд</span>;
  return <span className="badge bg-[#ff4757]/20 text-[#ff4757]">🆕 Новый</span>;
}

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [token, setToken] = useState<TokenRecord | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [error, setError] = useState("");
  const app = getTelegramWebApp();

  useEffect(() => {
    const goBack = () => router.back();
    app?.BackButton.show();
    app?.BackButton.onClick(goBack);
    return () => {
      app?.BackButton.hide();
      app?.BackButton.offClick?.(goBack);
    };
  }, [app, router]);

  useEffect(() => {
    if (!id) return;
    void getToken(id)
      .then(({ token }) => setToken(token))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Токен не найден"));
    void getTrades(id).then(setTrades).catch(() => {});
  }, [id]);

  if (error) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#ff4757]">{error}</div>;
  if (!token) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#8ba3c1]">Загрузка токена...</div>;

  const progress = Math.round(token.state.progress * 100);
  const shareToTelegram = () =>
    app?.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🚀 ${token.name} (${token.ticker}) on TONK.MEM!`)}`
    );
  const copyAddress = async () => navigator.clipboard.writeText(token.id);

  return (
    <div className="space-y-4 pb-24 pt-4">
      <div className="space-y-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[#1e3a5f] shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
            <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={56} height={56} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold text-white">{token.name}</h1>
            <span className="font-mono text-sm text-[#0088cc]">{token.ticker}</span>
          </div>
          <div className="ml-auto flex-shrink-0"><StatusBadge token={token} /></div>
        </div>

        {token.status === "GRADUATED_READY" || token.status === "LISTED" ? (
          <div className="overflow-hidden rounded-[24px] border border-[#00c896]/20 bg-[#0b1325]">
            <div className="relative min-h-[180px]">
              <Image src="/brand/img_08.jpg" alt="Graduated token" fill className="object-cover opacity-38" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,12,24,0.92),rgba(6,12,24,0.52))]" />
              <div className="relative flex min-h-[180px] flex-col justify-end p-5">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#00c896]/30 bg-[#00c896]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86efac]">
                  🎓 {token.status === "LISTED" ? "Listed on STON.fi" : "Graduated ready"}
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-white">Этот токен дошёл до graduation</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#c4d7ef]">Статус берётся из on-chain состояния и indexer cache, не из mock app logic.</p>
              </div>
            </div>
          </div>
        ) : null}

        {token.description ? <p className="text-sm text-[#8ba3c1]">{token.description}</p> : null}

        <div className="flex items-center gap-2 rounded-lg bg-[#1a2235] px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-[#8ba3c1]">{token.id.slice(0, 6)}...{token.id.slice(-4)}</span>
          <button onClick={copyAddress}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button>
        </div>

        <div className="flex flex-wrap gap-2">
          {token.links.telegram ? <a href={token.links.telegram} className="flex items-center gap-1.5 rounded-full border border-[#0088cc]/30 bg-[#0088cc]/15 px-3 py-1.5 text-xs text-[#0088cc]"><Send className="h-3.5 w-3.5" /> Telegram</a> : null}
          {token.links.twitter ? <a href={token.links.twitter} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8ba3c1]"><span className="text-[11px] font-bold">𝕏</span> Twitter</a> : null}
          {token.links.website ? <a href={token.links.website} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8ba3c1]"><Globe className="h-3.5 w-3.5" /> Сайт</a> : null}
        </div>

        <div className="glass-card space-y-2 p-4">
          <div className="flex justify-between text-sm"><span className="text-[#8ba3c1]">Прогресс до выхода</span><span className="font-mono font-bold text-[#00c896]">{progress}%</span></div>
          <ProgressBar progress={progress} />
          <div className="flex justify-between text-xs text-[#8ba3c1]"><span>💎 {(token.state.collectedTon ?? token.state.reserveTon).toFixed(2)} TON собрано</span><span>цель: {(token.state.targetTon ?? 8888).toLocaleString("ru-RU")} TON</span></div>
        </div>

        <button onClick={shareToTelegram} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0088cc]/30 bg-[#0088cc]/15 py-3 text-sm font-medium text-[#0088cc]"><Send className="h-4 w-4" /> Поделиться в Telegram</button>
      </div>

      <div className="px-4"><ChartPlaceholder trades={trades} /></div>
      <div className="px-4"><BuySellBox token={token} /></div>
      <div className="px-4"><LiveTrades trades={trades} /></div>
    </div>
  );
}
