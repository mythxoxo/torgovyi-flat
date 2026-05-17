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
    <Link href={href} className={`relative flex flex-col items-center justify-center gap-1 px-2 text-xs ${active ? "text-[#58a6ff]" : "text-[color:var(--text-muted)]"}`}>
      <span className={`rounded-lg px-3 py-1 ${active ? "bg-[#2979ff]/10" : ""}`}><Icon className="h-4 w-4" /></span>
      <span>{label}</span>
    </Link>
  );
}

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[color:var(--border)] bg-[rgba(13,17,23,0.9)] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2979ff]/20 bg-[#2979ff]/10 font-bold text-[#58a6ff]">T</div>
          <div>
            <span className="font-display text-lg font-bold text-white">TONK<span className="gradient-text">.MEM</span></span>
            <div className="text-[10px] font-semibold tracking-[0.18em] text-[#3fb950]">TESTNET</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LivePill className="hidden sm:flex" />
          <WalletConnectButton />
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[color:var(--border)] bg-[rgba(13,17,23,0.95)] pb-safe backdrop-blur-md">
        {navItems.map((item) => <NavItem key={item.href} {...item} active={pathname === item.href} />)}
      </nav>
    </div>
  );
}
