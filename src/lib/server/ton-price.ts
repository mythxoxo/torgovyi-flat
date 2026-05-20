export async function fetchTonPriceUsd(): Promise<{ usd: number | null; source: string }> {
  const tonapiKey = process.env.TONAPI_API_KEY;
  const sources = [
    {
      name: 'tonapi',
      url: 'https://tonapi.io/v2/rates?tokens=ton&currencies=usd',
      headers: tonapiKey ? { Authorization: `Bearer ${tonapiKey}` } : undefined,
      read: (data: any) => Number(data?.rates?.TON?.prices?.USD ?? data?.rates?.ton?.prices?.USD)
    },
    {
      name: 'coingecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd',
      read: (data: any) => Number(data?.['the-open-network']?.usd)
    }
  ];
  for (const source of sources) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 90 }, headers: source.headers });
      if (!res.ok) continue;
      const data = await res.json();
      const usd = source.read(data);
      if (Number.isFinite(usd) && usd > 0) return { usd, source: source.name };
    } catch {}
  }
  return { usd: null, source: 'unavailable' };
}
