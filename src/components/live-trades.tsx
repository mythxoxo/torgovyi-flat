import type { TradeRecord } from "../lib/shared";

function timeAgo(value: string) {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export function LiveTrades({ trades }: { trades: TradeRecord[] }) {
  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Сделки</h3>
        <span className="text-xs text-[#8ba3c1]">{trades.length} записей</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#1e3a5f]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111827] text-[#8ba3c1]">
            <tr>
              <th className="px-3 py-2 text-xs font-medium">Время</th>
              <th className="px-3 py-2 text-xs font-medium">Тип</th>
              <th className="px-3 py-2 text-xs font-medium">Токены</th>
              <th className="px-3 py-2 text-xs font-medium">TON</th>
              <th className="px-3 py-2 text-xs font-medium">Кошелёк</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 12).map((trade) => (
              <tr key={trade.id} className="border-t border-[#1e3a5f]">
                <td className="px-3 py-2 text-xs text-[#8ba3c1]">{timeAgo(trade.createdAt)}</td>
                <td className={`px-3 py-2 text-xs font-bold ${trade.side === "BUY" ? "text-[#00c896]" : "text-[#ff4757]"}`}>
                  {trade.side === "BUY" ? "Покупка" : "Продажа"}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-white">{trade.tokenAmount.toFixed(2)}</td>
                <td className="px-3 py-2 font-mono text-xs text-white">{(trade.side === "BUY" ? trade.tonAmountGross : trade.tonAmountNet).toFixed(2)} TON</td>
                <td className="px-3 py-2 font-mono text-xs text-[#0088cc]">{trade.wallet.slice(0, 4)}...{trade.wallet.slice(-4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
