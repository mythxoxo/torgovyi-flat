"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActivitySquare, Home, Rocket, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from 'react';
import { WalletConnectButton } from "./wallet-connect-button";
import { LivePill } from "./shared/live-pill";
import { useUi } from "./page-shell";
import { getTonPrice } from '../lib/market/ton-price';

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useUi();
  const [tonPrice, setTonPrice] = useState<number | null>(null);
  useEffect(() => { getTonPrice().then((r)=>setTonPrice(r.usd)).catch(()=>setTonPrice(null)); }, []);
  const navItems = [
    { href: "/", label: locale === 'ru' ? 'Токены' : 'Tokens', icon: Home },
    { href: "/create", label: locale === 'ru' ? 'Запуск' : 'Launch', icon: Rocket },
    { href: "/technical-status", label: locale === 'ru' ? 'Статус' : 'Status', icon: ActivitySquare },
    { href: "/my-tokens", label: locale === 'ru' ? 'Кошелёк' : 'Wallet', icon: Wallet }
  ];
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,136,204,0.15),transparent_32%),linear-gradient(180deg,#07111d,#091321_48%,#08111c)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#09111d]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-3"><Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={36} height={36} className="h-9 w-9" /><div><div className="font-display text-xl font-bold uppercase tracking-[0.08em] text-white">TONK<span className="gradient-text">.MEM</span></div><div className="text-[11px] tracking-[0.18em] text-[#8ba3c1]">Public beta</div></div></Link>
          <nav className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 p-1.5">{navItems.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-white text-black' : 'text-[#c7d5e8] hover:bg-white/8 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</Link>; })}</nav>
          <div className="flex items-center gap-3"><div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-[#c7d5e8]">{tonPrice ? `TON $${tonPrice.toFixed(2)}` : 'TON price unavailable'}</div><div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-[#c7d5e8]"><LivePill /></div><div className="rounded-full border border-white/8 bg-white/5 p-1"><button type="button" onClick={() => setLocale("ru")} className={`rounded-full px-3 py-1.5 text-xs ${locale === "ru" ? "bg-white text-black" : "text-[#c7d5e8]"}`}>RU</button><button type="button" onClick={() => setLocale("en")} className={`rounded-full px-3 py-1.5 text-xs ${locale === "en" ? "bg-white text-black" : "text-[#c7d5e8]"}`}>EN</button></div><WalletConnectButton /></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
