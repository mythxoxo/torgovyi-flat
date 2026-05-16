import Link from "next/link";

import type { TokenRecord } from "../lib/shared";

import { ProgressBar } from "./progress-bar";

export function TokenCard({ token }: { token: TokenRecord }) {
  return (
    <Link
      href={`/token/${token.id}`}
      className="card-surface block min-w-0 rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40"
    >
      <div className="flex min-w-0 gap-3">
        <img src={token.image} alt={token.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">{token.name}</h3>
              <p className="text-sm text-cyan-200">${token.ticker}</p>
            </div>
            <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-mist">
              {token.status}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-mist">
            <p>MC: {token.state.marketCapTon.toFixed(2)} TON</p>
            <p>Vol: {token.state.volumeTon.toFixed(2)} TON</p>
            <p>Holders: {token.holderCount}</p>
            <p>Progress: {(token.state.progress * 100).toFixed(1)}%</p>
          </div>
          <ProgressBar progress={token.state.progress} />
        </div>
      </div>
    </Link>
  );
}
