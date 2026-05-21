import type { TradeRecord } from '../lib/shared';
import { useUi } from './page-shell';
export function TradeFeed({ trades }: { trades: TradeRecord[] }) {
  const { t } = useUi();
  if (!trades.length) return <div className="glass-card rounded-[24px] p-6 text-center"><h3 className="text-xl font-semibold text-white">TONK.MEM</h3><p className="mt-2 text-sm text-[#8ba3c1]">{t.token.tradesEmpty}</p></div>;
  return <div className="glass-card rounded-[24px] p-4 space-y-2">{trades.slice(0,10).map((trade) => <div key={trade.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"><span className={trade.side==='BUY' ? 'text-[#7df9b7]' : 'text-[#ff9d9d]'}>{trade.side}</span><span className="font-mono text-white">{trade.tokenAmount.toFixed(2)}</span><span className="text-[#8ba3c1]">{trade.tonAmountGross.toFixed(2)} TON</span></div>)}</div>;
}
