"use client";

import { useEffect } from "react";

export function TmaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void import("@twa-dev/sdk").then(({ default: WebApp }) => {
      WebApp.ready();
      WebApp.expand();
    });
  }, []);

  return <>{children}</>;
}
