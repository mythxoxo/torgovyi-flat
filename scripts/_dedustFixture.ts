async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed with status code ${res.status}`);
  return res.json();
}

export async function getDedustReadyFixture() {
  const base = process.env.DEDUST_API_URL || 'https://api.dedust.io';
  const data = await fetchJson(`${base}/v2/pools?limit=50`);
  const pools = Array.isArray(data) ? data : Array.isArray(data?.pools) ? data.pools : [];
  const ready = pools.find((pool: any) => {
    const assets = Array.isArray(pool?.assets) ? pool.assets : [];
    return assets.length === 2 && assets.some((a: any) => a?.type === 'native') && assets.some((a: any) => a?.type === 'jetton' && a?.address);
  });
  if (!ready) return null;
  const jetton = ready.assets.find((a: any) => a?.type === 'jetton' && a?.address);
  return {
    poolAddress: ready.address || null,
    tokenAddress: jetton?.address || null,
  };
}
