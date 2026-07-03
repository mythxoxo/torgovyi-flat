"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Activity, Compass, Home, Search, User } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTonPrice } from "../lib/market/ton-price";
import { useUi } from "./page-shell";
import { BrandLogo } from "./brand-logo";

export function MobileShell({ children }: { children: ReactNode }) {
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
    <div className="premium-degen min-h-screen pb-[calc(84px+env(safe-area-inset-bottom))]">
      <header className="pd-shell-header pd-mobile-header sticky top-0 z-40 px-4 py-3">
        <div className="pd-mobile-header__top"><Link href="/" className="pd-mobile-header__logo"><BrandLogo subtitle={t.misc.mainnet} compact /></Link><WalletConnectButton compact /></div>
        {gramPrice ? <div className="pd-mobile-header__meta"><div className="pd-chip pd-chip-live">GRAM ${gramPrice.toFixed(2)}</div></div> : null}
      </header>
      <main className="pd-page px-4 py-5">{children}</main>
      <nav className="pd-nav fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around backdrop-blur-xl" style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[9px] font-semibold ${active ? "text-[#ff3d9a]" : "text-[#90a3b8]"}`}><Icon className="h-4 w-4" /><span className="truncate">{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
