"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Link2, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import type { ReactNode } from "react";
import { LivePill } from "./shared/live-pill";
import { TonPricePill } from "./shared/ton-price-pill";

const navItems = [
  { href: "/", label: "Маркет", icon: Home },
  { href: "/create", label: "Запуск", icon: Rocket },
  { href: "/my-tokens", label: "Портфель", icon: Wallet },
  { href: "/referrals", label: "Рефералы", icon: Link2 }
];

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <aside className="flex w-[250px] shrink-0 flex-col border-r" style={{ borderColor: "var(--border)", background: "rgba(7,4,10,0.96)" }}>
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={36} height={36} className="logo-animated" />
          <div>
            <div className="font-display text-[26px] uppercase tracking-[0.08em] text-white">TONK<span className="gradient-text">.MEM</span></div>
            <div className="text-[10px] font-bold tracking-[0.26em] text-[#3df6a2]">MAINNET</div>
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
        <div className="border-t space-y-2 p-4" style={{ borderColor: "var(--border)" }}>
          <div className="rounded-xl border border-[#1e3a5f] bg-[#111827]/80 px-3 py-2 text-xs text-[#8ba3c1]"><LivePill /></div>
          <div className="rounded-xl border border-[#1e3a5f] bg-[#111827]/80 px-3 py-2 font-mono text-xs text-[#7dd3fc]"><TonPricePill /></div>
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
