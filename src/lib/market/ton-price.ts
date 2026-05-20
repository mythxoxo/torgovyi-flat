export type TonPriceResponse = { usd: number | null; source?: string };
export async function getTonPrice(): Promise<TonPriceResponse> {
  const res = await fetch('/api/market/ton-price', { cache: 'no-store' });
  if (!res.ok) return { usd: null };
  return res.json();
}
export const formatTonUsd = (ton: number, usd: number | null) => usd ? `$${(ton * usd).toFixed(2)}` : 'TON price unavailable';
