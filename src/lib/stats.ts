export async function getLiveStats(): Promise<{ live: number }> {
  const res = await fetch('/api/stats/live', { cache: 'no-store' });
  if (!res.ok) return { live: 0 };
  return res.json();
}
