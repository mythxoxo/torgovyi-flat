"use client";

import type { ReactNode } from "react";
import { MobileShell } from "./mobile-shell";

export function PageShell({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
