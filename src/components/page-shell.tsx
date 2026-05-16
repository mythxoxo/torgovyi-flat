import Link from "next/link";
import type { ReactNode } from "react";

import { WalletConnectButton } from "./wallet-connect-button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/referrals", label: "Referrals" },
  { href: "/my-tokens", label: "My Tokens" }
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto box-border flex min-h-screen w-full max-w-5xl flex-col overflow-hidden px-4 pb-12 pt-5 sm:px-6">
      <header className="mb-6 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">TON launchpad</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Meme tokens in two taps</h1>
          </div>
          <div className="rounded-lg border border-cyan-400/30 px-3 py-1 text-xs text-cyan-200">
            Testnet
          </div>
        </div>
        <WalletConnectButton />
        <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-w-0 truncate rounded-lg border border-white/10 px-2 py-2 text-center text-xs text-mist transition hover:border-cyan-300 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
