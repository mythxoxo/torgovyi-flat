"use client";

import Image from "next/image";
import { Copy, Send } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTelegramWebApp, getTelegramUser } from "../lib/telegram";

export function ReferralPanel({ referralCode, shareUrl, earnedTon, volumeTon, pendingTon, connected }: { referralCode: string; shareUrl: string; earnedTon: number; volumeTon: number; pendingTon: number; connected: boolean; }) {
  const app = getTelegramWebApp();
  const user = getTelegramUser();
  const hasReferral = connected && Boolean((user?.id || referralCode) && String(user?.id || referralCode).trim());
  const refUrl = hasReferral ? `https://t.me/Myclawxyz_bot?ref=${user?.id ?? referralCode}` : "Connect wallet to generate referral link";
  const copy = async () => hasReferral ? navigator.clipboard.writeText(refUrl) : undefined;
  const shareRef = () => hasReferral ? app?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent("TONK.MEM referral access")}`) : undefined;

  return (
    <>
      <div className="px-4 pt-4">
        <div className="glass-card relative overflow-hidden rounded-[24px] p-5">
          <div className="absolute inset-0">
            <Image src="/brand/img_07.jpg" alt="referrals" fill className="object-cover opacity-18" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,12,24,0.9),rgba(6,12,24,0.58))]" />
          </div>
          <div className="relative max-w-sm">
            <p className="mb-1 text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Referral system</p>
            <h1 className="mb-2 font-display text-2xl font-bold text-white">Referrals</h1>
            <p className="text-sm leading-6 text-[#c4d7ef]">Referral flow stays hidden until wallet/ref data is actually available. No fake empty `ref_` values.</p>
          </div>
        </div>
      </div>

      <div className="mx-4 glass-card space-y-3 p-4">
        <p className="text-xs text-[#8ba3c1]">Your referral link</p>
        <div className="flex items-center gap-2 rounded-xl bg-[#1a2235] px-3 py-2.5"><span className="flex-1 truncate font-mono text-xs text-white">{refUrl}</span>{hasReferral ? <button onClick={copy}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button> : null}</div>
        {hasReferral ? <button onClick={shareRef} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0088cc] py-3 text-sm font-medium text-white"><Send className="h-4 w-4" /> Share in Telegram</button> : <WalletConnectButton />}
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
        {[{ label: 'Referrals', value: hasReferral ? 'active' : '—' }, { label: 'Earned', value: hasReferral ? `💎 ${earnedTon.toFixed(2)}` : '—' }, { label: 'Pending', value: hasReferral ? `💎 ${pendingTon.toFixed(2)}` : '—' }].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center"><div className="font-mono text-lg font-bold text-white">{stat.value}</div><div className="mt-0.5 text-xs text-[#8ba3c1]">{stat.label}</div></div>
        ))}
      </div>

      <div className="mx-4 mt-4 glass-card grid grid-cols-2 gap-3 p-4 text-sm text-[#8ba3c1]"><div><p>Volume</p><p className="mt-1 text-lg text-white">💎 {hasReferral ? volumeTon.toFixed(2) : '—'}</p></div><div><p>Code</p><p className="mt-1 text-lg text-[#00c896]">{hasReferral ? referralCode : '—'}</p></div></div>
    </>
  );
}
