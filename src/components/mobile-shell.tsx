"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, Link2, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { LivePill } from "./shared/live-pill";

const navItems = [
  { href: "/", label: "Маркет", icon: Home },
  { href: "/create", label: "Запуск", icon: Rocket },
  { href: "/my-tokens", label: "Портфель", icon: Wallet },
  { href: "/referrals", label: "Рефералы", icon: Link2 }
];

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} className={`relative flex flex-col items-center justify-center gap-1 px-2 text-[11px] ${active ? "text-[#53f6ff]" : "text-[color:var(--text-muted)]"}`}>
      <span className={`rounded-lg px-3 py-1 transition-all ${active ? "bg-[#53f6ff]/10 shadow-neon" : ""}`}><Icon className="h-4 w-4" /></span>
      <span>{label}</span>
    </Link>
  );
}

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[color:var(--border)] bg-[rgba(6,3,10,0.72)] px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#53f6ff]/25 bg-[#53f6ff]/10 font-display text-base text-[#53f6ff] animate-flicker">T</div>
          <div>
            <span className="font-display text-xl uppercase tracking-[0.08em] text-white">TONK<span className="gradient-text">.MEM</span></span>
            <div className="text-[10px] font-bold tracking-[0.22em] text-[#3df6a2]">TESTNET</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LivePill className="hidden sm:flex" />
          <WalletConnectButton />
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[color:var(--border)] bg-[rgba(6,3,10,0.94)] pb-safe backdrop-blur-xl">
        {navItems.map((item) => <NavItem key={item.href} {...item} active={pathname === item.href} />)}
      </nav>
    </div>
  );
}
