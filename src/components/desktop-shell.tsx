"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Link2, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import type { ReactNode } from "react";
import { LivePill } from "./shared/live-pill";

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
      <aside className="flex w-[240px] shrink-0 flex-col border-r" style={{ borderColor: "var(--border)", background: "rgba(14,16,24,0.95)" }}>
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2979ff]/20 bg-[#2979ff]/10 font-bold text-[#58a6ff]">T</div>
          <div>
            <div className="font-display text-xl font-bold text-white">TONK<span className="gradient-text">.MEM</span></div>
            <div className="text-[10px] font-semibold tracking-[0.18em] text-[#3fb950]">TESTNET</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${active ? "text-white" : "border-transparent text-[color:var(--text-muted)] hover:bg-white/5 hover:text-white"}`} style={active ? { background: "rgba(41,121,255,0.12)", borderColor: "rgba(41,121,255,0.2)" } : {}}>
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#58a6ff]" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
          <LivePill />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-6" style={{ borderColor: "var(--border)", background: "rgba(7,8,15,0.9)" }}>
          <div className="text-sm text-[color:var(--text-muted)]">{pathname === "/" ? "Маркет" : pathname === "/create" ? "Запуск токена" : pathname === "/my-tokens" ? "Портфель" : "Рефералы"}</div>
          <WalletConnectButton />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {(pathname === "/" || pathname.startsWith("/token")) ? (
        <aside className="hidden w-[280px] shrink-0 flex-col border-l xl:flex" style={{ borderColor: "var(--border)", background: "rgba(14,16,24,0.95)" }}>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}><span className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Live Activity</span></div>
          <div className="flex flex-1 items-center justify-center p-6"><div className="text-center"><p className="text-xs text-[color:var(--text-muted)]">Трейды появятся после первых сделок</p></div></div>
          <div className="border-t p-4" style={{ borderColor: "var(--border)" }}><Link href="/create" className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#2979ff" }}><Rocket className="h-4 w-4" />Запустить токен</Link></div>
        </aside>
      ) : null}
    </div>
  );
}
