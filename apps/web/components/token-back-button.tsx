"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TokenBackButton() {
  const router = useRouter();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    void import("@twa-dev/sdk").then(({ default: WebApp }) => {
      const onBack = () => router.back();
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(onBack);
      cleanup = () => {
        WebApp.BackButton.offClick(onBack);
        WebApp.BackButton.hide();
      };
    });

    return () => {
      cleanup?.();
    };
  }, [router]);

  return null;
}
