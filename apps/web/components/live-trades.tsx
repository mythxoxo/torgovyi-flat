import type { TradeRecord } from "@meme-launchpad/shared";

export function LiveTrades({ trades }: { trades: TradeRecord[] }) {
  return (
    <div className="card-surface rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Live trades</h3>
        <span className="text-xs text-mist">{trades.length} recent</span>
      </div>
      <div className="space-y-3">
        {trades.slice(0, 6).map((trade) => (
          <div key={trade.id} className="flex items-center justify-between text-sm">
            <div>
              <p className={trade.side === "BUY" ? "text-emerald-300" : "text-rose-300"}>{trade.side}</p>
              <p className="text-xs text-mist">{trade.wallet.slice(0, 6)}...{trade.wallet.slice(-4)}</p>
            </div>
            <div className="text-right">
              <p className="text-white">
                {trade.side === "BUY" ? trade.tonAmountGross.toFixed(2) : trade.tonAmountNet.toFixed(2)} TON
              </p>
              <p className="text-xs text-mist">{trade.tokenAmount.toFixed(2)} tokens</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
