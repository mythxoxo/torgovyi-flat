import type { TradeRecord } from '../shared';
export const tradesToPricePoints = (trades: TradeRecord[]) => trades.map((trade) => ({ time: Math.floor(new Date(trade.createdAt).getTime() / 1000), value: trade.spotPriceTon || 0 })).filter((p) => p.value > 0);
