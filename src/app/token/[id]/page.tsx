"use client";
import Image from 'next/image';
import { Copy, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { TokenRecord, TradeRecord } from '../../../lib/shared';
import { BuySellBox } from '../../../components/buy-sell-box';
import { TokenPriceChart } from '../../../components/token-price-chart';
import { TradeFeed } from '../../../components/trade-feed';
import { ProgressBar } from '../../../components/progress-bar';
import { getToken, getTrades } from '../../../lib/api';
import { getTelegramWebApp } from '../../../lib/telegram';

export default function TokenPage() {
  const params = useParams(); const router = useRouter(); const id = params?.id as string; const [token, setToken] = useState<TokenRecord | null>(null); const [trades, setTrades] = useState<TradeRecord[]>([]); const [error, setError] = useState(''); const app = getTelegramWebApp();
  useEffect(() => { const goBack = () => router.back(); app?.BackButton.show(); app?.BackButton.onClick(goBack); return () => { app?.BackButton.hide(); app?.BackButton.offClick?.(goBack); }; }, [app, router]);
  useEffect(() => { if (!id) return; void getToken(id).then(({ token }) => setToken(token)).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Token not found')); void getTrades(id).then(setTrades).catch(() => {}); }, [id]);
  if (error) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#ff4757]">{error}</div>;
  if (!token) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#8ba3c1]">Loading token...</div>;
  const progress = Math.round(token.state.progress * 100); const shareToTelegram = () => app?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🚀 ${token.name} (${token.ticker}) on TONS of GRAM`)}`); const copyAddress = async () => navigator.clipboard.writeText(token.id);
  return <div className="space-y-4 pb-24 pt-4"><div className="space-y-4 px-4"><div className="flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-xl border border-[#1e3a5f]"><Image src={token.image || '/brand/img_04.jpg'} alt={token.name} width={56} height={56} className="h-full w-full object-cover" /></div><div className="min-w-0"><h1 className="truncate font-display text-xl font-bold text-white">{token.name}</h1><span className="font-mono text-sm text-[#2aabee]">{token.ticker}</span></div></div>{token.description ? <p className="text-sm text-[#8ba3c1]">{token.description}</p> : null}<div className="flex items-center gap-2 rounded-lg bg-[#1a2235] px-3 py-2"><span className="flex-1 truncate font-mono text-xs text-[#8ba3c1]">{token.id.slice(0, 6)}...{token.id.slice(-4)}</span><button onClick={copyAddress}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button></div><div className="glass-card space-y-2 p-4"><div className="flex justify-between text-sm"><span className="text-[#8ba3c1]">Progress to graduation</span><span className="font-mono font-bold text-[#5ac8fa]">{progress}%</span></div><ProgressBar progress={progress} /><div className="flex justify-between text-xs text-[#8ba3c1]"><span>💎 {(token.state.collectedTon ?? token.state.reserveTon).toFixed(2)} GRAM collected</span><span>target: {(token.state.targetTon ?? 8888).toLocaleString('en-US')} GRAM</span></div></div><button onClick={shareToTelegram} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2aabee]/30 bg-[#2aabee]/15 py-3 text-sm font-medium text-[#5ac8fa]"><Send className="h-4 w-4" /> Share in Telegram</button></div><div className="grid gap-4 px-4 xl:grid-cols-[1.4fr_0.8fr]"><TokenPriceChart trades={trades} /><BuySellBox token={token} /></div><div className="px-4"><TradeFeed trades={trades} /></div></div>;
}
