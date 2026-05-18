"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, Link2, Rocket, Wallet } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { LivePill } from "./shared/live-pill";
import { getTelegramUser } from "../lib/telegram";

const navItems = [
  { href: "/", label: "Маркет", icon: Home },
  { href: "/create", label: "Запуск", icon: Rocket },
  { href: "/my-tokens", label: "Портфель", icon: Wallet },
  { href: "/referrals", label: "Рефералы", icon: Link2 }
];

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} className={`relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 border-t-2 px-2 text-[10px] ${active ? "border-[#0088cc] text-[#0088cc]" : "border-transparent text-[#8ba3c1]"}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = getTelegramUser();

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-transparent pb-[calc(88px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1e3a5f] bg-[#0a0f1a]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-shrink-0 items-center gap-2">
          <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={24} height={24} className="h-6 w-6" />
          <span className="font-display text-base font-bold">
            TONK<span className="gradient-text">.MEM</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8ba3c1]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00c896] animate-pulse" />
          <LivePill />
        </div>

        <div className="flex items-center gap-2">
          {user?.photo_url ? <img src={user.photo_url} alt={user.first_name || "avatar"} className="h-7 w-7 rounded-full" /> : null}
          <WalletConnectButton />
        </div>
      </header>

      <main>{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t border-[#1e3a5f] bg-[#0a0f1a]/95 backdrop-blur-md"
        style={{ height: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => <NavItem key={item.href} {...item} active={pathname === item.href} />)}
      </nav>
    </div>
  );
}
