"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, Link2, Menu, Rocket, Wallet, X } from "lucide-react";
import { useState } from "react";
import { WalletConnectButton } from "./wallet-connect-button";
import { LivePill } from "./shared/live-pill";
import { TonPricePill } from "./shared/ton-price-pill";
import { getTelegramUser } from "../lib/telegram";
import { useUi } from "./page-shell";

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = getTelegramUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, t } = useUi();

  const navItems = [
    { href: "/", label: t.nav.market, icon: Home },
    { href: "/create", label: t.nav.create, icon: Rocket },
    { href: "/my-tokens", label: t.nav.portfolio, icon: Wallet },
    { href: "/referrals", label: t.nav.referrals, icon: Link2 }
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-transparent pb-[calc(88px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#090d16]/92 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
              aria-label={t.misc.menu}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={26} height={26} className="h-6 w-6" />
              <div className="min-w-0">
                <div className="truncate font-display text-[15px] font-bold leading-none text-white">TONK<span className="gradient-text">.MEM</span></div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7dd3fc]">{t.misc.launchpad}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.photo_url ? <img src={user.photo_url} alt={user.first_name || "avatar"} className="h-8 w-8 rounded-full border border-white/10" /> : null}
            <WalletConnectButton />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#c6d4ea]">
            <div className="mb-1 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#00c896]" /><LivePill /></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-[#7dd3fc]"><TonPricePill /></div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm border-r border-white/10 bg-[#090d16] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-bold text-white">TONK<span className="gradient-text">.MEM</span></div>
                <div className="mt-1 text-[11px] text-[#8ba3c1]">Mainnet TMA</div>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${active ? "border-[#7dd3fc]/40 bg-[#101828] text-white" : "border-white/8 bg-white/4 text-[#c6d4ea]"}`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/4 p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-[#8ba3c1]">{t.misc.language}</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setLocale("ru")} className={`rounded-2xl px-3 py-3 text-sm font-medium ${locale === "ru" ? "bg-[#7dd3fc] text-black" : "bg-white/5 text-white"}`}>{t.misc.russian}</button>
                <button type="button" onClick={() => setLocale("en")} className={`rounded-2xl px-3 py-3 text-sm font-medium ${locale === "en" ? "bg-[#7dd3fc] text-black" : "bg-white/5 text-white"}`}>{t.misc.english}</button>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/4 p-4 text-sm text-[#c6d4ea]">
              <div className="font-semibold text-white">{t.faq.title}</div>
              <div className="mt-2 space-y-2 text-sm leading-6">
                <Link href="/#faq" onClick={() => setMenuOpen(false)} className="block">{t.nav.faq}</Link>
                <Link href="/#rules" onClick={() => setMenuOpen(false)} className="block">{t.nav.rules}</Link>
                <Link href="/#risks" onClick={() => setMenuOpen(false)} className="block">{t.nav.risks}</Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main>{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t border-white/8 bg-[#090d16]/95 backdrop-blur-xl" style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 text-[10px] ${active ? "text-[#7dd3fc]" : "text-[#8ba3c1]"}`}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
