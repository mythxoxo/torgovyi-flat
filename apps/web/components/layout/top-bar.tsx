"use client";

import { useEffect, useState } from "react";

import { getTelegramWebApp } from "../../lib/telegram";
import { WalletConnectButton } from "../wallet-connect-button";

export function TopBar() {
  const [liveCount, setLiveCount] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    const webApp = getTelegramWebApp();
    setPhotoUrl(webApp?.initDataUnsafe?.user?.photo_url ?? "");

    const loadLiveCount = async () => {
      try {
        const response = await fetch("/tokens?filter=trending", { cache: "no-store" });
        const tokens = (await response.json()) as Array<{ status?: string }>;
        if (mounted) {
          setLiveCount(tokens.filter((token) => token.status === "BONDING").length);
        }
      } catch {
        if (mounted) {
          setLiveCount(0);
        }
      }
    };

    void loadLiveCount();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1e3a5f] bg-[#0a0f1a]/95 px-4 py-3 backdrop-blur-md">
      <div className="flex shrink-0 items-center gap-2">
        <img src="/brand/logo-icon.svg" className="h-6 w-6" alt="logo" />
        <span className="font-syne text-base font-bold text-white">
          TONK<span className="gradient-text">.MEM</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#8ba3c1]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00c896]" />
        <span>{liveCount} live</span>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {photoUrl ? <img src={photoUrl} className="h-7 w-7 rounded-full" alt="avatar" /> : null}
        <WalletConnectButton compact />
      </div>
    </header>
  );
}
