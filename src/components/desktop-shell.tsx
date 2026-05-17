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
      <aside className="flex w-[250px] shrink-0 flex-col border-r" style={{ borderColor: "var(--border)", background: "rgba(6,8,22,0.96)" }}>
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#31f2ff]/25 bg-[#31f2ff]/10 font-display text-sm font-bold text-[#31f2ff] animate-flicker">T</div>
          <div>
            <div className="font-display text-xl font-bold uppercase tracking-[0.06em] text-white">TONK<span className="gradient-text">.MEM</span></div>
            <div className="text-[10px] font-bold tracking-[0.24em] text-[#27f1a8]">TESTNET</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${active ? "text-white" : "border-transparent text-[color:var(--text-muted)] hover:bg-white/5 hover:text-white"}`} style={active ? { background: "rgba(49,242,255,0.10)", borderColor: "rgba(49,242,255,0.2)" } : {}}>
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#31f2ff]" : ""}`} />
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
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-6 backdrop-blur-md" style={{ borderColor: "var(--border)", background: "rgba(11,17,37,0.82)" }}>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{pathname === "/" ? "LIVE BOARD" : pathname === "/create" ? "TOKEN LAUNCH" : pathname === "/my-tokens" ? "YOUR BAG" : "REF LOOP"}</div>
          <WalletConnectButton />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {(pathname === "/" || pathname.startsWith("/token")) ? (
        <aside className="hidden w-[280px] shrink-0 flex-col border-l xl:flex" style={{ borderColor: "var(--border)", background: "rgba(6,8,22,0.96)" }}>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}><span className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Live Activity</span></div>
          <div className="flex flex-1 items-center justify-center p-6"><div className="text-center"><p className="text-xs text-[color:var(--text-muted)]">пока тихо</p></div></div>
          <div className="border-t p-4" style={{ borderColor: "var(--border)" }}><Link href="/create" className="btn-primary flex w-full items-center justify-center gap-2"><Rocket className="h-4 w-4" />Запустить токен</Link></div>
        </aside>
      ) : null}
    </div>
  );
}
