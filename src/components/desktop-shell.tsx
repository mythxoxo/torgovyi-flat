"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Compass, Home, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { WalletConnectButton } from "./wallet-connect-button";
import { useUi } from "./page-shell";
import { getTonPrice } from "../lib/market/ton-price";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { BrandLogo } from "./brand-logo";

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useUi();
  const [gramPrice, setGramPrice] = useState<number | null>(null);

  useEffect(() => { getTonPrice().then((r) => setGramPrice(r.usd)).catch(() => setGramPrice(null)); }, []);

  const navItems = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/terminal", label: "Terminal", icon: Activity },
    { href: "/search", label: t.nav.search, icon: Search },
    { href: "/markets", label: t.nav.markets, icon: Compass },
    { href: "/my-tokens", label: t.nav.profile, icon: User }
  ];

  return (
    <div className="premium-degen">
      <header className="pd-shell-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center"><BrandLogo subtitle={t.misc.mainnet} /></Link>
          <nav className="pd-nav flex items-center gap-2 rounded-full p-1.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return <Link key={href} href={href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "pd-nav-active" : "pd-nav-idle"}`}><Icon className="h-4 w-4" />{label}</Link>;
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="pd-chip pd-chip-live">{gramPrice ? `GRAM $${gramPrice.toFixed(2)}` : t.misc.mainnet}</div>
            <ThemeSwitcher />
            <LanguageSwitcher />
            <WalletConnectButton />
          </div>
        </div>
      </header>
      <main className="pd-page mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
