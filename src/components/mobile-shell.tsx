"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Compass, Home, Search, User } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTonPrice } from "../lib/market/ton-price";
import { useUi } from "./page-shell";
import { LanguageSwitcher } from "./language-switcher";

function HeaderWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 leading-none">
      <span className={`${compact ? "text-[19px]" : "text-[22px]"} font-black tracking-[-0.08em] text-white`}>TONS</span>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c7a86b] text-[8px] font-black lowercase text-[#0a0b0d] shadow-[0_0_18px_rgba(199,168,107,0.28)]">of</span>
      <span className={`${compact ? "text-[19px]" : "text-[22px]"} bg-gradient-to-r from-[#f1d999] via-[#c7a86b] to-[#8f6f36] bg-clip-text font-black tracking-[-0.08em] text-transparent`}>GRAM</span>
    </span>
  );
}

export function MobileShell({ children }: { children: ReactNode }) {
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
    <div className="gram-shell min-h-screen pb-[calc(84px+env(safe-area-inset-bottom))] text-white">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0b0d]/90 px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center">
            <HeaderWordmark compact />
          </Link>
          <WalletConnectButton compact />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {gramPrice ? (
              <div className="gram-chip px-3 py-2 text-[11px]">
                GRAM ${gramPrice.toFixed(2)}
              </div>
            ) : (
              <div className="gram-chip px-3 py-2 text-[11px]">{t.misc.mainnet}</div>
            )}
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="px-4 py-5">{children}</main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t border-white/8 bg-[#0a0b0d]/96 shadow-[0_-24px_60px_rgba(0,0,0,0.44)] backdrop-blur-2xl"
        style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`mx-1 flex h-[54px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] transition ${
                active ? "bg-[#c7a86b]/14 text-[#f1d999]" : "text-[#8e929a] hover:text-[#f4ead2]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
