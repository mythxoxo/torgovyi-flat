"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { WalletConnectButton } from "./wallet-connect-button";
import { useUi } from "./page-shell";
import { getTonPrice } from "../lib/market/ton-price";
import { LanguageSwitcher } from "./language-switcher";

function HeaderWordmark() {
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <span className="text-[28px] font-black tracking-[-0.08em] text-white">TONS</span>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c7a86b] text-[9px] font-black lowercase text-[#0a0b0d] shadow-[0_0_20px_rgba(199,168,107,0.3)]">of</span>
      <span className="bg-gradient-to-r from-[#f1d999] via-[#c7a86b] to-[#8f6f36] bg-clip-text text-[28px] font-black tracking-[-0.08em] text-transparent">GRAM</span>
    </span>
  );
}

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useUi();
  const [gramPrice, setGramPrice] = useState<number | null>(null);

  useEffect(() => {
    getTonPrice().then((r) => setGramPrice(r.usd)).catch(() => setGramPrice(null));
  }, []);

  const navItems = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/search", label: t.nav.search, icon: Search },
    { href: "/markets", label: t.nav.markets, icon: Compass },
    { href: "/my-tokens", label: t.nav.profile, icon: User }
  ];

  return (
    <div className="gram-shell min-h-screen text-white">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0b0d]/84 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center">
            <HeaderWordmark />
          </Link>

          <nav className="flex items-center gap-1.5 rounded-[20px] border border-white/8 bg-white/[0.035] p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-[15px] px-4 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-[#c7a86b] text-[#0a0b0d] shadow-[0_12px_30px_rgba(199,168,107,0.22)]" : "text-[#9ea6b2] hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {gramPrice ? (
              <div className="gram-chip">
                GRAM ${gramPrice.toFixed(2)}
              </div>
            ) : (
              <div className="gram-chip">{t.misc.mainnet}</div>
            )}
            <LanguageSwitcher />
            <WalletConnectButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
