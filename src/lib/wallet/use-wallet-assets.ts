"use client";
import { useEffect, useState } from 'react';
import type { WalletAssetsResponse } from '../server/wallet-assets';
export function useWalletAssets(address?: string) {
  const [data, setData] = useState<WalletAssetsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/wallet/assets?address=${encodeURIComponent(address)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ok: false, address, jettons: [], source: 'fallback', reason: 'mainnet_api_failed', message: 'Wallet assets are not available yet. Check mainnet API keys and try again later.', tonBalanceFormatted: '—' }))
      .finally(() => setLoading(false));
  }, [address]);
  return { data, loading };
}
