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
import { ThemeSwitcher } from "./theme-switcher";
import { BrandLogo } from "./brand-logo";

export function MobileShell({ children }: { children: ReactNode }) {
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
    : "bg-[radial-gradient(circle_at_top,rgba(42,171,238,0.18),transparent_34%),linear-gradient(180deg,#0e1621,#101923_48%,#0b111a)] text-white";
  const headerBg = theme === "light" ? "border-[#dbe8f4] bg-white/92" : "border-white/8 bg-[#0e1621]/92";
  const navBg = theme === "light" ? "border-[#dbe8f4] bg-white/96" : "border-white/8 bg-[#0e1621]/96";
  const inactive = theme === "light" ? "text-[#64748b]" : "text-[#8ba3c1]";
  const pillBg = theme === "light" ? "border-[#dbe8f4] bg-white/80 text-[#334155]" : "border-white/8 bg-white/5 text-[#c7d5e8]";

  return (
    <div className={`min-h-screen pb-[calc(84px+env(safe-area-inset-bottom))] ${shellBg}`}>
      <header className={`sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-xl ${headerBg}`}>
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="min-w-0">
            <BrandLogo subtitle={t.misc.mainnet} compact />
          </Link>
          <WalletConnectButton compact />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {gramPrice ? (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${pillBg}`}>
              GRAM ${gramPrice.toFixed(2)}
            </div>
          ) : null}
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="px-4 py-5">{children}</main>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t backdrop-blur-xl ${navBg}`}
        style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 text-[10px] ${
                active ? "text-[#0088cc]" : inactive
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
