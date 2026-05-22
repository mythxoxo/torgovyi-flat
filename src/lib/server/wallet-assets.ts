import { Address } from '@ton/core';
import { formatTokenAmount, formatTonFromNano } from '../format/amount';

export type WalletAssetsResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
  address?: string;
  source?: 'tonapi' | 'toncenter' | 'mixed' | 'fallback';
  tonBalanceNano?: string | null;
  tonBalanceFormatted?: string | null;
  jettons: Array<{
    address?: string;
    master?: string;
    symbol?: string;
    name?: string;
    image?: string;
    decimals?: number;
    balanceRaw?: string;
    balanceFormatted: string;
    priceUsd?: number | null;
    valueUsd?: number | null;
  }>;
};

const tonapiBase = (process.env.TONAPI_ENDPOINT || 'https://tonapi.io/v2').replace(/\/$/, '');
const toncenterBase = (process.env.TONCENTER_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC').replace(/\/$/, '');

const cleanFallbackMessage = 'Assets are temporarily unavailable. Try again in a moment.';

function normalizeTonapiBase(base: string) {
  return /\/v2$/i.test(base) ? base : `${base}/v2`;
}

function normalizeToncenterJsonRpc(base: string) {
  return /\/jsonRPC$/i.test(base) ? base : `${base}/jsonRPC`;
}

function makeFailure(address: string, reason: string, message = cleanFallbackMessage): WalletAssetsResponse {
  return {
    ok: false,
    address,
    source: 'fallback',
    reason,
    message,
    tonBalanceNano: null,
    tonBalanceFormatted: null,
    jettons: []
  };
}

async function fetchToncenterBalance(address: string, apiKey?: string): Promise<{ balance: string | null; reason?: string }> {
  if (!apiKey) return { balance: null, reason: 'toncenter_key_missing' };
  try {
    const res = await fetch(normalizeToncenterJsonRpc(toncenterBase), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'getAddressBalance',
        params: { address }
      }),
      cache: 'no-store'
    });

    if (!res.ok) return { balance: null, reason: `toncenter_${res.status}` };
    const data = await res.json();
    if (typeof data?.result === 'string' || typeof data?.result === 'number') {
      return { balance: String(data.result) };
    }
    return { balance: null, reason: 'toncenter_bad_response' };
  } catch (error) {
    console.error('[wallet-assets:toncenter]', error instanceof Error ? error.message : 'toncenter_failed');
    return { balance: null, reason: 'toncenter_failed' };
  }
}

export async function getWalletAssets(inputAddress: string): Promise<WalletAssetsResponse> {
  let parsed: Address;
  try {
    parsed = Address.parse(inputAddress);
  } catch {
    return makeFailure(inputAddress, 'invalid_address', 'Invalid wallet address.');
  }

  const address = parsed.toString({ bounceable: false, testOnly: false });
  const tonapiKey = process.env.TONAPI_API_KEY;
  const toncenterKey = process.env.TONCENTER_API_KEY;

  if (!tonapiKey && !toncenterKey) {
    return makeFailure(address, 'api_keys_missing');
  }

  const tonapiUrlBase = normalizeTonapiBase(tonapiBase);
  let tonapiReason: string | undefined;
  let toncenterReason: string | undefined;
  let tonapiAccountStatus: number | undefined;
  let tonapiJettonsStatus: number | undefined;
  let tonBalanceNano: string | null = null;
  let jettons: WalletAssetsResponse['jettons'] = [];
  let source: WalletAssetsResponse['source'] = 'fallback';

  if (tonapiKey) {
    try {
      const [accountRes, jettonsRes] = await Promise.all([
        fetch(`${tonapiUrlBase}/accounts/${address}`, {
          headers: { Authorization: `Bearer ${tonapiKey}` },
          cache: 'no-store'
        }),
        fetch(`${tonapiUrlBase}/accounts/${address}/jettons`, {
          headers: { Authorization: `Bearer ${tonapiKey}` },
          cache: 'no-store'
        })
      ]);

      tonapiAccountStatus = accountRes.status;
      tonapiJettonsStatus = jettonsRes.status;

      if (accountRes.ok) {
        const account = await accountRes.json();
        if (account?.balance !== undefined && account?.balance !== null) {
          tonBalanceNano = String(account.balance);
          source = 'tonapi';
        } else {
          tonapiReason = 'tonapi_bad_response';
        }
      } else {
        tonapiReason = `tonapi_${accountRes.status}`;
      }

      if (jettonsRes.ok) {
        const payload = await jettonsRes.json();
        jettons = Array.isArray(payload?.balances)
          ? payload.balances.map((item: any) => {
              const rawDecimals = item?.jetton?.decimals ?? item?.metadata?.decimals ?? item?.decimals ?? 9;
              const decimals = Number.isFinite(Number(rawDecimals)) ? Number(rawDecimals) : 9;
              const balanceRaw = String(item?.balance ?? item?.wallet?.balance ?? item?.jetton?.balance ?? item?.quantity ?? item?.amount ?? '0');
              const priceUsd = item?.price?.prices?.USD ? Number(item.price.prices.USD) : null;
              const formatted = formatTokenAmount(balanceRaw, decimals, 9);
              return {
                address: item?.wallet_address || item?.address || undefined,
                master: item?.jetton?.address || item?.master?.address || undefined,
                symbol: item?.jetton?.symbol || item?.metadata?.symbol || 'JETTON',
                name: item?.jetton?.name || item?.metadata?.name || 'Jetton',
                image: item?.jetton?.image || item?.metadata?.image || undefined,
                decimals,
                balanceRaw,
                balanceFormatted: formatted,
                priceUsd,
                valueUsd: priceUsd ? Number(formatted || '0') * priceUsd : null
              };
            })
          : [];
        source = source === 'tonapi' ? 'tonapi' : 'mixed';
      } else if (!tonapiReason) {
        tonapiReason = `tonapi_${jettonsRes.status}`;
      }
    } catch (error) {
      console.error('[wallet-assets:tonapi]', error instanceof Error ? error.message : 'tonapi_failed');
      tonapiReason = 'tonapi_failed';
    }
  } else {
    tonapiReason = 'tonapi_key_missing';
  }

  if (!tonBalanceNano) {
    const fallback = await fetchToncenterBalance(address, toncenterKey);
    tonBalanceNano = fallback.balance;
    toncenterReason = fallback.reason;
    if (tonBalanceNano) {
      source = source === 'tonapi' || source === 'mixed' ? 'mixed' : 'toncenter';
    }
  }

  if (!tonBalanceNano && jettons.length === 0) {
    const reason = tonapiReason || toncenterReason || 'assets_unavailable';
    const details = [
      tonapiAccountStatus ? `tonapi_account_status=${tonapiAccountStatus}` : null,
      tonapiJettonsStatus ? `tonapi_jettons_status=${tonapiJettonsStatus}` : null,
      toncenterReason ? `toncenter_reason=${toncenterReason}` : null
    ].filter(Boolean).join('; ');
    return makeFailure(address, reason, details ? `${cleanFallbackMessage} (${details})` : cleanFallbackMessage);
  }

  return {
    ok: true,
    address,
    source,
    tonBalanceNano,
    tonBalanceFormatted: tonBalanceNano ? formatTonFromNano(tonBalanceNano) : null,
    reason: !jettons.length && tonBalanceNano ? 'jettons_unavailable' : undefined,
    message: !jettons.length && tonBalanceNano ? 'Token list is temporarily unavailable. TON balance is shown from mainnet.' : undefined,
    jettons
  };
}
