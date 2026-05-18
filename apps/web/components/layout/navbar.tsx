"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {children}
    </svg>
  );
}

const navItems = [
  {
    href: "/",
    icon: (
      <Icon>
        <path d="M3 11L12 3l9 8" />
        <path d="M5 10v10h14V10" />
      </Icon>
    ),
    label: "Маркет"
  },
  {
    href: "/create",
    icon: (
      <Icon>
        <path d="M5 19c3-8 7-12 14-14-2 7-6 11-14 14Z" />
        <path d="M14 6l4 4" />
      </Icon>
    ),
    label: "Запуск"
  },
  {
    href: "/my-tokens",
    icon: (
      <Icon>
        <path d="M4 7h16v12H4z" />
        <path d="M16 11h4v4h-4z" />
      </Icon>
    ),
    label: "Портфель"
  },
  {
    href: "/referrals",
    icon: (
      <Icon>
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </Icon>
    ),
    label: "Рефералы"
  }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#1e3a5f] bg-[#0a0f1a]/95 backdrop-blur-md"
      style={{ height: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center border-t-2 px-1 text-[11px] transition ${
              active ? "border-[#0088cc] text-[#0088cc]" : "border-transparent text-[#8ba3c1]"
            }`}
          >
            {item.icon}
            <span className="mt-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
