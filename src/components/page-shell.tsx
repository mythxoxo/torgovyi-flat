"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, Link2, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Rocket },
  { href: "/my-tokens", label: "My Tokens", icon: Wallet },
  { href: "/referrals", label: "Refs", icon: Link2 }
];

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} className={`relative flex flex-col items-center justify-center gap-1 px-2 text-xs ${active ? "text-[#0088cc]" : "text-[#8ba3c1]"}`}>
      {active ? <span className="absolute -top-2 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-[#0088cc]" /> : null}
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1e3a5f] bg-[#0a0f1a]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={28} height={28} className="h-7 w-7" />
          <span className="font-display text-lg font-bold text-white">
            TONK<span className="gradient-text">.MEM</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 text-xs text-[#8ba3c1] sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00c896]" />
            <span>142 live</span>
          </div>
          <WalletConnectButton />
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#1e3a5f] bg-[#0a0f1a]/95 pb-safe backdrop-blur-md">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </nav>
    </div>
  );
}
