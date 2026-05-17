"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Link2, Rocket, TrendingUp, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import type { ReactNode } from "react";
import { LivePill } from "./shared/live-pill";

const navItems = [
  { href: "/", label: "Markets", icon: Home },
  { href: "/create", label: "Launch", icon: Rocket },
  { href: "/my-tokens", label: "Portfolio", icon: Wallet },
  { href: "/referrals", label: "Referrals", icon: Link2 }
];

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <aside className="flex w-[240px] shrink-0 flex-col border-r" style={{ borderColor: "var(--border)", background: "rgba(14,16,24,0.95)" }}>
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={32} height={32} />
          <span className="font-display text-xl font-bold text-white">TONK<span className="gradient-text">.MEM</span></span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "text-white" : "text-[color:var(--text-muted)] hover:bg-white/5 hover:text-white"}`} style={active ? { background: "rgba(41,121,255,0.12)", color: "var(--green)" } : {}}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t p-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}><span className="flex items-center gap-1.5"><LivePill /> </span></div>
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}><span>24h Volume</span><span className="font-mono" style={{ color: "var(--green)" }}>12.4K TON</span></div>
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}><span>Tokens live</span><span className="font-mono text-white">38</span></div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6" style={{ borderColor: "var(--border)", background: "rgba(7,8,15,0.9)" }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <TrendingUp className="h-4 w-4" />
            <span style={{ color: "var(--text-primary)" }}>{pathname === "/" ? "Markets" : pathname === "/create" ? "Launch Token" : pathname === "/my-tokens" ? "My Portfolio" : "Referrals"}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden max-w-[360px] items-center gap-2 overflow-hidden text-xs xl:flex" style={{ color: "var(--text-muted)" }}><Activity className="h-3 w-3 shrink-0" style={{ color: "var(--green)" }} /><span>Live trades</span></div>
            <WalletConnectButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {(pathname === "/" || pathname.startsWith("/token")) ? (
        <aside className="hidden w-[280px] shrink-0 flex-col border-l xl:flex" style={{ borderColor: "var(--border)", background: "rgba(14,16,24,0.95)" }}>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}><span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Live Activity</span></div>
          <div className="scrollbar-none flex-1 space-y-2 overflow-y-auto p-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg p-2 text-xs" style={{ background: "var(--surface)" }}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: i % 2 === 0 ? "var(--green)" : "var(--red)" }} />
                <span className="flex-1 truncate" style={{ color: "var(--text-muted)" }}>@trader{Math.floor(Math.random() * 999)}</span>
                <span className="font-mono font-bold" style={{ color: i % 2 === 0 ? "var(--green)" : "var(--red)" }}>{i % 2 === 0 ? "+" : "-"}{(Math.random() * 5).toFixed(2)} TON</span>
              </div>
            ))}
          </div>
          <div className="border-t p-4" style={{ borderColor: "var(--border)" }}><Link href="/create" className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90" style={{ background: "var(--green)" }}><Rocket className="h-4 w-4" />Launch Token</Link></div>
        </aside>
      ) : null}
    </div>
  );
}
