export async function getLiveStats(): Promise<{ live: number }> {
  const res = await fetch('/api/stats/live', { cache: 'no-store' });
  if (!res.ok) return { live: 0 };
  return res.json();
}

export async function getTonPrice(): Promise<{ usd: number | null; source?: string }> {
  const res = await fetch('/api/stats/ton-price', { cache: 'no-store' });
  if (!res.ok) return { usd: null };
  return res.json();
}
