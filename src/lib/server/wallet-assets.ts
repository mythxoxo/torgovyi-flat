import { fetchTonPriceUsd } from './ton-price';

export type WalletAssetsResponse = {
  ok: boolean;
  address: string;
  tonBalance?: string | null;
  jettons: Array<{ masterAddress: string; walletAddress?: string | null; symbol: string; name: string; balance: string; decimals: number; image?: string | null; isTonkmemToken?: boolean }>;
  source: 'tonapi' | 'toncenter' | 'fallback';
  error?: string;
};

export async function getWalletAssets(address: string): Promise<WalletAssetsResponse> {
  const key = process.env.TONAPI_API_KEY;
  try {
    const res = await fetch(`https://tonapi.io/v2/accounts/${address}/jettons`, { headers: key ? { Authorization: `Bearer ${key}` } : {}, next: { revalidate: 90 } });
    const balanceRes = await fetch(`https://tonapi.io/v2/accounts/${address}`, { headers: key ? { Authorization: `Bearer ${key}` } : {}, next: { revalidate: 90 } });
    const data = res.ok ? await res.json() : null;
    const acc = balanceRes.ok ? await balanceRes.json() : null;
    const jettons = Array.isArray(data?.balances) ? data.balances.map((item: any) => ({
      masterAddress: item?.jetton?.address || '', walletAddress: item?.wallet_address || null, symbol: item?.jetton?.symbol || 'JETTON', name: item?.jetton?.name || 'Jetton', balance: item?.balance || '0', decimals: Number(item?.jetton?.decimals || 9), image: item?.jetton?.image || null, isTonkmemToken: false
    })) : [];
    return { ok: true, address, tonBalance: acc?.balance || null, jettons, source: 'tonapi' };
  } catch {
    return { ok: true, address, tonBalance: null, jettons: [], source: 'fallback', error: 'Wallet assets unavailable right now' };
  }
}
