"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { WalletConnectButton } from "./wallet-connect-button";
import { useUi } from "./page-shell";
import { getTonPrice } from "../lib/market/ton-price";
import { LanguageSwitcher } from "./language-switcher";

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
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050b16]/82 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/tons-of-gram-header.svg"
              alt="TONS of GRAM"
              width={260}
              height={46}
              priority
              className="h-[42px] w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center gap-1.5 rounded-[20px] border border-white/8 bg-white/[0.035] p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-[15px] px-4 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-[#0098ea] text-white shadow-[0_12px_30px_rgba(0,152,234,0.28)]" : "text-[#aebdd0] hover:bg-white/8 hover:text-white"
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
