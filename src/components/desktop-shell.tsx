"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Link2, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import type { ReactNode } from "react";
import { LivePill } from "./shared/live-pill";
import { TonPricePill } from "./shared/ton-price-pill";
import { useUi } from "./page-shell";

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useUi();
  const navItems = [
    { href: "/", label: t.nav.market, icon: Home },
    { href: "/create", label: t.nav.create, icon: Rocket },
    { href: "/my-tokens", label: t.nav.portfolio, icon: Wallet },
    { href: "/referrals", label: t.nav.referrals, icon: Link2 }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <aside className="flex w-[280px] shrink-0 flex-col border-r" style={{ borderColor: "var(--border)", background: "rgba(7,4,10,0.96)" }}>
        <div className="border-b px-5 py-5" style={{ borderColor: "var(--border)" }}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0e1523] p-4">
            <div className="absolute inset-0 opacity-30"><Image src="/brand/img_12.jpg" alt="brand" fill className="object-cover" /></div>
            <div className="relative flex items-center gap-3">
              <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={42} height={42} className="logo-animated" />
              <div>
                <div className="font-display text-[28px] uppercase tracking-[0.08em] text-white">TONK<span className="gradient-text">.MEM</span></div>
                <div className="text-[10px] font-bold tracking-[0.26em] text-[#7dd3fc]">INVESTOR REVIEW MVP</div>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${active ? "text-white" : "border-transparent text-[color:var(--text-muted)] hover:bg-white/5 hover:text-white"}`} style={active ? { background: "rgba(255,70,199,0.1)", borderColor: "rgba(83,246,255,0.25)" } : {}}>
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#53f6ff]" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t space-y-3 p-4" style={{ borderColor: "var(--border)" }}>
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#111827]/80 px-3 py-3 text-xs text-[#8ba3c1]"><LivePill /></div>
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#111827]/80 px-3 py-3 font-mono text-xs text-[#7dd3fc]"><TonPricePill /></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#8ba3c1]">{t.misc.language}</div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setLocale("ru")} className={`rounded-xl px-3 py-2 text-sm font-medium ${locale === "ru" ? "bg-[#7dd3fc] text-black" : "bg-white/5 text-white"}`}>{t.misc.russian}</button>
              <button type="button" onClick={() => setLocale("en")} className={`rounded-xl px-3 py-2 text-sm font-medium ${locale === "en" ? "bg-[#7dd3fc] text-black" : "bg-white/5 text-white"}`}>{t.misc.english}</button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-6 backdrop-blur-md" style={{ borderColor: "var(--border)", background: "rgba(18,9,23,0.78)" }}>
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{pathname === "/" ? "DEGEN BOARD" : pathname === "/create" ? "MINT GATE" : pathname === "/my-tokens" ? "YOUR BAG" : "REF FARM"}</div>
          <WalletConnectButton />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {(pathname === "/" || pathname.startsWith("/token")) ? (
        <aside className="hidden w-[280px] shrink-0 flex-col border-l xl:flex" style={{ borderColor: "var(--border)", background: "rgba(7,4,10,0.96)" }}>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}><span className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Radar</span></div>
          <div className="flex flex-1 items-center justify-center p-6"><div className="text-center"><p className="text-xs text-[color:var(--text-muted)]">Трейды появятся после первых сделок</p></div></div>
          <div className="border-t p-4" style={{ borderColor: "var(--border)" }}><Link href="/create" className="btn-primary flex w-full items-center justify-center gap-2"><Rocket className="h-4 w-4" />Запустить токен</Link></div>
        </aside>
      ) : null}
    </div>
  );
}
