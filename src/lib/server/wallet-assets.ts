export type WalletAssetsResponse = {
  ok: boolean;
  address?: string;
  tonBalance?: string | null;
  jettons: Array<{ masterAddress: string; walletAddress?: string | null; symbol: string; name: string; balance: string; decimals: number; image?: string | null; isTonkmemToken?: boolean }>;
  source: 'tonapi' | 'fallback';
  reason?: string;
  message?: string;
};

export async function getWalletAssets(address: string): Promise<WalletAssetsResponse> {
  const key = process.env.TONAPI_API_KEY;
  if (!key) return { ok: false, address, jettons: [], source: 'fallback', reason: 'wallet_assets_unavailable', message: 'Wallet assets are not available yet.' };
  try {
    const [res, balanceRes] = await Promise.all([
      fetch(`https://tonapi.io/v2/accounts/${address}/jettons`, { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 90 } }),
      fetch(`https://tonapi.io/v2/accounts/${address}`, { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 90 } })
    ]);
    if (!res.ok || !balanceRes.ok) return { ok: false, address, jettons: [], source: 'fallback', reason: 'wallet_assets_unavailable', message: 'Wallet assets are not available yet.' };
    const data = await res.json();
    const acc = await balanceRes.json();
    const jettons = Array.isArray(data?.balances) ? data.balances.map((item: any) => ({ masterAddress: item?.jetton?.address || '', walletAddress: item?.wallet_address || null, symbol: item?.jetton?.symbol || 'JETTON', name: item?.jetton?.name || 'Jetton', balance: item?.balance || '0', decimals: Number(item?.jetton?.decimals || 9), image: item?.jetton?.image || null, isTonkmemToken: false })) : [];
    return { ok: true, address, tonBalance: acc?.balance || '0', jettons, source: 'tonapi' };
  } catch {
    return { ok: false, address, jettons: [], source: 'fallback', reason: 'wallet_assets_unavailable', message: 'Wallet assets are not available yet.' };
  }
}
