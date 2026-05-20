import { formatTokenAmount, formatTonFromNano } from '../format/amount';

export type WalletAssetsResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
  address?: string;
  tonBalance?: string;
  tonBalanceFormatted?: string;
  jettons: Array<{
    name: string;
    symbol: string;
    balance: string;
    balanceFormatted: string;
    decimals?: number;
    image?: string;
    address?: string;
  }>;
  source: 'tonapi' | 'toncenter' | 'fallback';
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
    const jettons = Array.isArray(data?.balances) ? data.balances.map((item: any) => {
      const decimals = Number(item?.jetton?.decimals ?? item?.metadata?.decimals ?? item?.decimals ?? 9);
      const rawBalance = String(item?.balance ?? item?.wallet?.balance ?? item?.jetton?.balance ?? item?.quantity ?? item?.amount ?? '0');
      return {
        name: item?.jetton?.name || 'Jetton',
        symbol: item?.jetton?.symbol || 'JETTON',
        balance: rawBalance,
        balanceFormatted: formatTokenAmount(rawBalance, decimals),
        decimals,
        image: item?.jetton?.image || undefined,
        address: item?.jetton?.address || undefined
      };
    }) : [];
    const tonBalance = String(acc?.balance ?? '0');
    return { ok: true, address, tonBalance, tonBalanceFormatted: formatTonFromNano(tonBalance), jettons, source: 'tonapi' };
  } catch {
    return { ok: false, address, jettons: [], source: 'fallback', reason: 'wallet_assets_unavailable', message: 'Wallet assets are not available yet.' };
  }
}
