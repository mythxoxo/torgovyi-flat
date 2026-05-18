import type { TradeSide } from "@meme-launchpad/shared";

type TickerTrade = {
  id: string;
  side: TradeSide;
  wallet: string;
  tonAmountGross: number;
  tonAmountNet: number;
  createdAt: string;
  tokenName: string;
};

function timeAgo(value: string): string {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export function Ticker({ trades }: { trades: TickerTrade[] }) {
  if (trades.length === 0) {
    return (
      <div className="overflow-hidden border-b border-[#1e3a5f] bg-[#0a1628] py-1.5 text-center text-xs text-[#8ba3c1]">
        Сделки появятся здесь
      </div>
    );
  }

  return (
    <div className="overflow-hidden border-b border-[#1e3a5f] bg-[#0a1628] py-1.5">
      <div className="animate-marquee flex gap-10 whitespace-nowrap text-xs">
        {[...trades, ...trades].map((trade, index) => {
          const isBuy = trade.side === "BUY";
          const amount = isBuy ? trade.tonAmountGross : trade.tonAmountNet;

          return (
            <span key={`${trade.id}-${index}`} className="flex items-center gap-1.5">
              <span className={isBuy ? "text-[#00c896]" : "text-[#ff4757]"}>{isBuy ? "🟢" : "🔴"}</span>
              <span className="text-[#8ba3c1]">@{trade.wallet.slice(0, 6)}</span>
              <span className="font-bold text-white">{isBuy ? "купил" : "продал"}</span>
              <span className="font-mono text-[#0088cc]">💎 {amount.toFixed(2)} TON</span>
              <span className="font-medium text-white">{trade.tokenName}</span>
              <span className="text-[#8ba3c1]">{timeAgo(trade.createdAt)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
