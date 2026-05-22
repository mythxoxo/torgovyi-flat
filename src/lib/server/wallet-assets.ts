import { formatTokenAmount, formatTonFromNano } from '../format/amount';

export type WalletAssetsResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
  address?: string;
  source?: 'tonapi' | 'toncenter' | 'fallback';
  tonBalanceNano?: string;
  tonBalanceFormatted?: string;
  jettons: Array<{
    address?: string;
    symbol?: string;
    name?: string;
    balanceRaw?: string;
    decimals?: number;
    balanceFormatted?: string;
    image?: string;
  }>;
};

const tonapiBase = (process.env.TONAPI_ENDPOINT || 'https://tonapi.io').replace(/\/$/, '');
const toncenterBase = (process.env.TONCENTER_ENDPOINT || 'https://toncenter.com/api/v2').replace(/\/$/, '');

async function fetchToncenterBalance(address: string, apiKey?: string): Promise<string | null> {
  try {
    const url = new URL(`${toncenterBase}/getAddressBalance`);
    url.searchParams.set('address', address);
    if (apiKey) url.searchParams.set('api_key', apiKey);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.result === 'string' ? data.result : null;
  } catch {
    return null;
  }
}

export async function getWalletAssets(address: string): Promise<WalletAssetsResponse> {
  const tonapiKey = process.env.TONAPI_API_KEY;
  const toncenterKey = process.env.TONCENTER_API_KEY;

  if (!tonapiKey && !toncenterKey) {
    return {
      ok: false,
      address,
      source: 'fallback',
      reason: 'api_keys_missing',
      message: 'Wallet assets are not available yet. Check mainnet API keys and try again later.',
      tonBalanceFormatted: '—',
      jettons: []
    };
  }

  try {
    let tonBalanceNano: string | null = null;
    let jettons: WalletAssetsResponse['jettons'] = [];
    let source: WalletAssetsResponse['source'] = 'fallback';

    if (tonapiKey) {
      const [jettonsRes, accountRes] = await Promise.all([
        fetch(`${tonapiBase}/v2/accounts/${address}/jettons`, {
          headers: { Authorization: `Bearer ${tonapiKey}` },
          cache: 'no-store'
        }),
        fetch(`${tonapiBase}/v2/accounts/${address}`, {
          headers: { Authorization: `Bearer ${tonapiKey}` },
          cache: 'no-store'
        })
      ]);

      if (jettonsRes.ok) {
        const data = await jettonsRes.json();
        jettons = Array.isArray(data?.balances)
          ? data.balances.map((item: any) => {
              const rawDecimals = item?.jetton?.decimals ?? item?.metadata?.decimals ?? item?.decimals;
              const decimals = Number.isFinite(Number(rawDecimals)) ? Number(rawDecimals) : 9;
              const balanceRaw = String(item?.balance ?? item?.wallet?.balance ?? item?.jetton?.balance ?? item?.quantity ?? item?.amount ?? '0');
              return {
                name: item?.jetton?.name || 'Jetton',
                symbol: item?.jetton?.symbol || 'JETTON',
                balanceRaw,
                decimals,
                balanceFormatted: formatTokenAmount(balanceRaw, decimals),
                image: item?.jetton?.image || undefined,
                address: item?.jetton?.address || undefined
              };
            })
          : [];
        source = 'tonapi';
      }

      if (accountRes.ok) {
        const account = await accountRes.json();
        tonBalanceNano = String(account?.balance ?? '0');
        source = 'tonapi';
      }
    }

    if (!tonBalanceNano) {
      tonBalanceNano = await fetchToncenterBalance(address, toncenterKey);
      if (tonBalanceNano) source = source === 'tonapi' ? 'tonapi' : 'toncenter';
    }

    if (!tonBalanceNano && jettons.length === 0) {
      return {
        ok: false,
        address,
        source: 'fallback',
        reason: 'mainnet_api_failed',
        message: 'Wallet assets are not available yet. Check mainnet API keys and try again later.',
        tonBalanceFormatted: '—',
        jettons: []
      };
    }

    return {
      ok: true,
      address,
      source,
      tonBalanceNano: tonBalanceNano || '0',
      tonBalanceFormatted: tonBalanceNano ? formatTonFromNano(tonBalanceNano) : '—',
      jettons
    };
  } catch (error) {
    console.error('[wallet-assets]', error instanceof Error ? error.message : 'mainnet_api_failed');
    return {
      ok: false,
      address,
      source: 'fallback',
      reason: 'mainnet_api_failed',
      message: 'Wallet assets are not available yet. Check mainnet API keys and try again later.',
      tonBalanceFormatted: '—',
      jettons: []
    };
  }
}
