"use client";

import { Copy, Send } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTelegramWebApp, getTelegramUser } from "../lib/telegram";

export function ReferralPanel({ referralCode, shareUrl, earnedTon, volumeTon, pendingTon, connected }: { referralCode: string; shareUrl: string; earnedTon: number; volumeTon: number; pendingTon: number; connected: boolean; }) {
  const app = getTelegramWebApp();
  const user = getTelegramUser();
  const hasReferral = connected && Boolean((user?.id || referralCode) && String(user?.id || referralCode).trim());
  const refUrl = hasReferral ? `https://t.me/Myclawxyz_bot?ref=${user?.id ?? referralCode}` : "Connect wallet to generate your referral link.";
  const copy = async () => hasReferral ? navigator.clipboard.writeText(refUrl) : undefined;
  const shareRef = () => hasReferral ? app?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent("TONK.MEM referral access")}`) : undefined;

  return (
    <div className="space-y-5">
      <section className="glass-card rounded-[28px] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Referrals</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Referral links are live. Rewards depend on indexed eligible buys.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c6d4ea]">Link generation and sharing work. Reward and claim values reflect stored backend accounting and remain zero until eligible indexed buys exist.</p>
      </section>

      <section className="glass-card rounded-[28px] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8ba3c1]">Referral link</p>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="flex-1 truncate font-mono text-xs text-white">{refUrl}</span>{hasReferral ? <button onClick={copy}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button> : null}</div>
        <div className="mt-4">{hasReferral ? <button onClick={shareRef} className="btn-primary flex w-full items-center justify-center gap-2"><Send className="h-4 w-4" /> Share in Telegram</button> : <WalletConnectButton />}</div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Status', value: hasReferral ? 'Share-ready / tracked by backend state' : 'Wallet required' },
          { label: 'Earned', value: `💎 ${earnedTon.toFixed(2)}` },
          { label: 'Pending', value: `💎 ${pendingTon.toFixed(2)}` }
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center"><div className="font-mono text-lg font-bold text-white">{stat.value}</div><div className="mt-1 text-xs text-[#8ba3c1]">{stat.label}</div></div>
        ))}
      </section>

      <section className="glass-card rounded-[28px] p-5 text-sm text-[#c6d4ea]">{hasReferral ? `Current visible metrics: volume ${volumeTon.toFixed(2)} TON, code ${referralCode || user?.id || ''}. Claim/earn totals update from persisted backend accounting.` : "Connect wallet to generate your referral link."}</section>
    </div>
  );
}
