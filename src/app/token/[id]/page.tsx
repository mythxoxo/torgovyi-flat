"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { TokenRecord, TradeRecord } from "../../../lib/shared";
import { BuySellBox } from "../../../components/buy-sell-box";
import { ChartPlaceholder } from "../../../components/chart-placeholder";
import { FeeBreakdown } from "../../../components/fee-breakdown";
import { LiveTrades } from "../../../components/live-trades";
import { ProgressBar } from "../../../components/progress-bar";
import { getToken, getTrades } from "../../../lib/api";

export default function TokenPage() {
  const params = useParams();
  const id = params?.id as string;

  const [token, setToken] = useState<TokenRecord | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    void getToken(id)
      .then(({ token }) => setToken(token))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Token not found");
      });
    void getTrades(id).then(setTrades).catch(() => {});
  }, [id]);

  if (error) {
    return (
      <div className="card-surface rounded-xl p-4 text-sm text-rose-300">{error}</div>
    );
  }

  if (!token) {
    return (
      <div className="card-surface rounded-xl p-4 text-sm text-mist">Loading token...</div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex items-start gap-4">
        {token.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={token.image}
            alt={token.ticker}
            className="h-14 w-14 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{token.ticker}</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{token.name}</h2>
          <p className="mt-1 text-sm text-mist">{token.description}</p>
        </div>
      </section>

      <div className="card-surface rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-mist">Status</span>
          <span className="text-white">{token.status}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-mist">Price</span>
          <span className="text-white">{token.state.currentPriceTon.toFixed(8)} TON</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-mist">Market cap</span>
          <span className="text-white">{token.state.marketCapTon.toFixed(2)} TON</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-mist">Volume</span>
          <span className="text-white">{token.state.volumeTon.toFixed(2)} TON</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-mist">Holders</span>
          <span className="text-white">{token.holderCount}</span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-mist">
            <span>Bonding progress</span>
            <span>{(token.state.progress * 100).toFixed(1)}%</span>
          </div>
          <ProgressBar progress={token.state.progress} />
        </div>
      </div>

      <ChartPlaceholder />

      {token.status === "BONDING" && (
        <BuySellBox token={token} />
      )}

      <FeeBreakdown
        baseFee="0.75%"
        creatorTax={`${(token.creatorTax.rate * 100).toFixed(1)}% (${token.creatorTax.mode})`}
        totalFee={`${((0.0075 + token.creatorTax.rate) * 100).toFixed(2)}%`}
        note="Fees split between platform, creator, and referrer on every trade."
      />

      <LiveTrades trades={trades} />
    </div>
  );
}
