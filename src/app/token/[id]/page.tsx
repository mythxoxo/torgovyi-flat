"use client";

import Image from "next/image";
import { Copy, Globe, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { TokenRecord, TradeRecord } from "../../../lib/shared";
import { BuySellBox } from "../../../components/buy-sell-box";
import { ChartPlaceholder } from "../../../components/chart-placeholder";
import { FeeBreakdown } from "../../../components/fee-breakdown";
import { LiveTrades } from "../../../components/live-trades";
import { ProgressBar } from "../../../components/progress-bar";
import { getToken, getTrades } from "../../../lib/api";

function StatusBadge({ token }: { token: TokenRecord }) {
  const progress = Math.round(token.state.progress * 100);
  if (token.status === "GRADUATED") return <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">✅ Graduated</span>;
  if (progress >= 75) return <span className="rounded-full bg-[#00c896]/20 px-2 py-0.5 text-xs text-[#00c896]">💎 Almost Grad</span>;
  return <span className="rounded-full bg-[#0088cc]/20 px-2 py-0.5 text-xs text-[#0088cc]">🔥 Trending</span>;
}

export default function TokenPage() {
  const params = useParams();
  const id = params?.id as string;
  const [token, setToken] = useState<TokenRecord | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    void getToken(id).then(({ token }) => setToken(token)).catch((err: unknown) => setError(err instanceof Error ? err.message : "Token not found"));
    void getTrades(id).then(setTrades).catch(() => {});
  }, [id]);

  if (error) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#ff4757]">{error}</div>;
  if (!token) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#8ba3c1]">Loading token...</div>;

  const progress = Math.round(token.state.progress * 100);
  const shareToTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🚀 ${token.name} ($${token.ticker}) на TONK.MEM!`)}`);
  const copyAddress = async () => navigator.clipboard.writeText(token.id);

  return (
    <div className="space-y-4 pb-24 pt-4">
      <div className="space-y-4 px-4">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[#1e3a5f]"><Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={56} height={56} className="h-14 w-14 object-cover" /></div>
          <div><h1 className="font-display text-xl font-bold text-white">{token.name}</h1><span className="font-mono text-sm text-[#0088cc]">${token.ticker}</span></div>
          <div className="ml-auto"><StatusBadge token={token} /></div>
        </div>
        {token.description ? <p className="text-sm text-[#8ba3c1]">{token.description}</p> : null}
        <div className="flex items-center gap-2 rounded-lg bg-[#1a2235] px-3 py-2"><span className="flex-1 truncate font-mono text-xs text-[#8ba3c1]">{token.id}</span><button onClick={copyAddress}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button></div>
        <div className="flex flex-wrap gap-2">
          {token.links.telegram ? <a href={token.links.telegram} className="flex items-center gap-1.5 rounded-full border border-[#0088cc]/30 bg-[#0088cc]/15 px-3 py-1.5 text-xs text-[#0088cc]"><Send className="h-3.5 w-3.5" /> Telegram</a> : null}
          {token.links.twitter ? <a href={token.links.twitter} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8ba3c1]"><span className="text-[11px] font-bold">𝕏</span> Twitter</a> : null}
          {token.links.website ? <a href={token.links.website} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8ba3c1]"><Globe className="h-3.5 w-3.5" /> Website</a> : null}
        </div>
        <div className="glass-card space-y-2 p-4"><div className="flex justify-between text-sm"><span className="text-[#8ba3c1]">Graduation progress</span><span className="font-mono font-bold text-[#00c896]">{progress}%</span></div><ProgressBar progress={progress} /><div className="flex justify-between text-xs text-[#8ba3c1]"><span>💎 {token.state.reserveTon.toFixed(2)} TON raised</span><span>цель: {token.state.graduationTargetTon} TON</span></div></div>
        <button onClick={shareToTelegram} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0088cc]/30 bg-[#0088cc]/15 py-3 text-sm font-medium text-[#0088cc]"><Send className="h-4 w-4" /> Поделиться в Telegram</button>
      </div>
      <div className="px-4"><ChartPlaceholder progress={token.state.progress} /></div>
      <div className="px-4"><BuySellBox token={token} /></div>
      <div className="px-4"><FeeBreakdown baseFee="0.75%" creatorTax={`${(token.creatorTax.rate * 100).toFixed(1)}% (${token.creatorTax.mode})`} totalFee={`${((0.0075 + token.creatorTax.rate) * 100).toFixed(2)}%`} note="Fees split between platform, creator, and referrer on every trade." /></div>
      <div className="px-4"><LiveTrades trades={trades} /></div>
    </div>
  );
}
