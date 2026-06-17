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
import { ThemeSwitcher } from "./theme-switcher";

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t, theme } = useUi();
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

  const shellBg = theme === "light"
    ? "bg-[radial-gradient(circle_at_top,rgba(0,136,204,0.10),transparent_34%),linear-gradient(180deg,#f4f7fb,#eef4fa_48%,#f8fbff)] text-[#111827]"
    : "bg-[radial-gradient(circle_at_top,rgba(42,171,238,0.16),transparent_32%),linear-gradient(180deg,#0e1621,#101923_48%,#0b111a)] text-white";
  const headerBg = theme === "light" ? "border-[#dbe8f4] bg-white/86" : "border-white/8 bg-[#0e1621]/86";
  const navBg = theme === "light" ? "border-[#dbe8f4] bg-white/70" : "border-white/8 bg-white/5";
  const inactiveNav = theme === "light" ? "text-[#475569] hover:bg-[#eaf6ff] hover:text-[#111827]" : "text-[#c7d5e8] hover:bg-white/8 hover:text-white";
  const pillBg = theme === "light" ? "border-[#dbe8f4] bg-white/80 text-[#334155]" : "border-white/8 bg-white/5 text-[#c7d5e8]";

  return (
    <div className={`min-h-screen ${shellBg}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/logo-icon.svg" alt="GRAM" width={36} height={36} className="h-9 w-9" />
            <div>
              <div className="font-display text-xl font-bold tracking-[-0.04em] text-[var(--gram-text)]">
                TONS <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0088cc] text-[9px] font-black text-white">of</span> <span className="gradient-text">GRAM</span>
              </div>
              {t.misc.mainnet ? <div className="text-[11px] tracking-[0.18em] text-[var(--gram-muted)]">{t.misc.mainnet}</div> : null}
            </div>
          </Link>

          <nav className={`flex items-center gap-2 rounded-full border p-1.5 ${navBg}`}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-[#0088cc] text-white" : inactiveNav
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${pillBg}`}>
              {gramPrice ? `GRAM $${gramPrice.toFixed(2)}` : t.misc.mainnet}
            </div>
            <ThemeSwitcher />
            <LanguageSwitcher />
            <WalletConnectButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
