"use client";

import { useEffect, useState } from "react";
import { MobileShell } from "./mobile-shell";
import { DesktopShell } from "./desktop-shell";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isDesktop) return <DesktopShell>{children}</DesktopShell>;
  return <MobileShell>{children}</MobileShell>;
}
