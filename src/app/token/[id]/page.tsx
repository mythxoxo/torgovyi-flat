"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { TradeRecord } from "../../../lib/shared";
import type { ExternalTokenRecord } from "../../../lib/external-tokens/types";
import type { MarketToken } from "../../../lib/market/types";
import { resolveMarketToken } from "../../../lib/market/resolve-market-token";
import { getTrades } from "../../../lib/api";
import { getTelegramWebApp } from "../../../lib/telegram";
import { LaunchpadTokenView } from "../../../components/token/launchpad-token-view";
import { ExternalTokenView } from "../../../components/token/external-token-view";

async function resolveExternalTokenViaApi(id: string): Promise<ExternalTokenRecord | null> {
  try {
    const res = await fetch('/api/external-tokens', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json() as { tokens?: ExternalTokenRecord[] };
    const decoded = decodeURIComponent(id).trim().toLowerCase();
    return (data.tokens || []).find((token) => token.address.trim().toLowerCase() === decoded) || null;
  } catch {
    return null;
  }
}

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [marketToken, setMarketToken] = useState<MarketToken | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [error, setError] = useState("");
  const app = getTelegramWebApp();

  useEffect(() => {
    const goBack = () => router.back();
    app?.BackButton.show();
    app?.BackButton.onClick(goBack);
    return () => {
      app?.BackButton.hide();
      app?.BackButton.offClick?.(goBack);
    };
  }, [app, router]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError("");
    setMarketToken(null);
    setTrades([]);
    void resolveExternalTokenViaApi(id).then((external) => {
      if (cancelled) return;
      if (external) {
        setMarketToken({ source: "EXTERNAL", token: external });
        setTrades([]);
        return;
      }

      return resolveMarketToken(id).then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setError("Token not found");
          return;
        }
        setMarketToken(resolved);
        if (resolved.source === "LAUNCHPAD") {
          void getTrades(resolved.token.id).then((rows) => {
            if (!cancelled) setTrades(rows);
          }).catch(() => {
            if (!cancelled) setTrades([]);
          });
        } else {
          setTrades([]);
        }
      });
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Token not found");
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#ff4757]">{error}</div>;
  if (!marketToken) return <div className="mx-4 mt-4 glass-card p-4 text-sm text-[#8ba3c1]">Loading token...</div>;

  if (marketToken.source === "EXTERNAL") return <ExternalTokenView token={marketToken.token} />;
  return <LaunchpadTokenView token={marketToken.token} trades={trades} />;
}
