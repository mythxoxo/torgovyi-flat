"use client";

import { Copy, Send } from "lucide-react";

export function ReferralPanel({ referralCode, shareUrl, earnedTon, volumeTon }: { referralCode: string; shareUrl: string; earnedTon: number; volumeTon: number; }) {
  const copy = async () => navigator.clipboard.writeText(shareUrl);
  const shareRef = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("🚀 Join TONK.MEM and launch on TON")}`);

  return (
    <>
      <div className="mx-4 mt-6 flex justify-center"><img src="/brand/img_07.jpg" alt="referrals" className="mb-4 h-40 w-40 rounded-2xl object-cover opacity-80" /></div>
      <div className="mx-4 glass-card space-y-2 p-4">
        <p className="text-xs text-[#8ba3c1]">Твоя реферальная ссылка</p>
        <div className="flex items-center gap-2 rounded-xl bg-[#1a2235] px-3 py-2.5"><span className="flex-1 truncate font-mono text-xs text-white">{shareUrl}</span><button onClick={copy}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button></div>
        <button onClick={shareRef} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0088cc] py-3 text-sm font-medium text-white transition-all hover:brightness-110"><Send className="h-4 w-4" /> Поделиться в Telegram</button>
      </div>
      <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
        {[{ label: 'Рефералов', value: referralCode ? 1 : 0 }, { label: 'Заработано', value: `💎 ${earnedTon.toFixed(2)}` }, { label: 'Ожидает', value: `💎 ${Math.max(0, earnedTon * 0.2).toFixed(2)}` }].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center"><div className="font-mono text-lg font-bold text-white">{stat.value}</div><div className="mt-0.5 text-xs text-[#8ba3c1]">{stat.label}</div></div>
        ))}
      </div>
      <div className="mx-4 mt-4 glass-card grid grid-cols-2 gap-3 p-4 text-sm text-[#8ba3c1]"><div><p>Volume</p><p className="mt-1 text-lg text-white">💎 {volumeTon.toFixed(2)}</p></div><div><p>Code</p><p className="mt-1 text-lg text-[#00c896]">{referralCode}</p></div></div>
    </>
  );
}
