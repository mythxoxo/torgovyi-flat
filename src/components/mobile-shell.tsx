"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from 'react';
import { ActivitySquare, Home, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { LivePill } from "./shared/live-pill";
import { getTonPrice } from '../lib/market/ton-price';
import { useUi } from './page-shell';
import { LanguageSwitcher } from './language-switcher';

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale } = useUi();
  const [tonPrice, setTonPrice] = useState<number | null>(null);
  useEffect(() => { getTonPrice().then((r)=>setTonPrice(r.usd)).catch(()=>setTonPrice(null)); }, []);
  const navItems = [
    { href: "/", label: locale === 'ru' ? 'Токены' : 'Tokens', icon: Home },
    { href: "/create", label: locale === 'ru' ? 'Запуск' : 'Launch', icon: Rocket },
    { href: "/technical-status", label: locale === 'ru' ? 'Статус' : 'Status', icon: ActivitySquare },
    { href: "/my-tokens", label: locale === 'ru' ? 'Кошелёк' : 'Wallet', icon: Wallet }
  ];
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,136,204,0.14),transparent_34%),linear-gradient(180deg,#07111d,#091321_48%,#08111c)] pb-[calc(84px+env(safe-area-inset-bottom))] text-white"><header className="sticky top-0 z-40 border-b border-white/8 bg-[#09111d]/92 px-4 py-3 backdrop-blur-xl"><div className="flex items-center justify-between gap-3"><Link href="/" className="flex min-w-0 items-center gap-3"><Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={32} height={32} className="h-8 w-8" /><div className="min-w-0"><div className="truncate font-display text-[16px] font-bold text-white">TONK<span className="gradient-text">.MEM</span></div><div className="text-[10px] tracking-[0.16em] text-[#8ba3c1]">{locale === 'ru' ? 'Публичная бета' : 'Public beta'}</div></div></Link><WalletConnectButton compact /></div><div className="mt-3 flex flex-wrap gap-2"><div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-[#c7d5e8]">{tonPrice ? `TON $${tonPrice.toFixed(2)}` : (locale === 'ru' ? 'Цена TON временно недоступна' : 'TON price unavailable')}</div><div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-[#c7d5e8]"><LivePill /></div><LanguageSwitcher /></div></header><main className="px-4 py-5">{children}</main><nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t border-white/8 bg-[#09111d]/96 backdrop-blur-xl" style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}>{navItems.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 text-[10px] ${active ? 'text-[#7dd3fc]' : 'text-[#8ba3c1]'}`}><Icon className="h-4 w-4" /><span>{label}</span></Link>; })}</nav></div>;
}
