"use client";
import { useEffect, useState } from 'react';
import type { WalletAssetsResponse } from '../server/wallet-assets';
export function useWalletAssets(address?: string) {
  const [data, setData] = useState<WalletAssetsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!address) {
      setData(null);
      setErrorMessage(null);
      return;
    }
    setData(null);
    setLoading(true);
    setErrorMessage(null);
    fetch(`/api/wallet/assets?address=${encodeURIComponent(address)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((payload: WalletAssetsResponse) => {
        setData(payload);
        if (!payload.ok) setErrorMessage(payload.message || payload.reason || 'Assets are temporarily unavailable. Try again in a moment.');
      })
      .catch(() => {
        const fallback = { ok: false, address, jettons: [], source: 'fallback', reason: 'assets_unavailable', message: 'Assets are temporarily unavailable. Try again in a moment.', tonBalanceNano: null, tonBalanceFormatted: null } as WalletAssetsResponse;
        setData(fallback);
        setErrorMessage(fallback.message || fallback.reason || 'Assets are temporarily unavailable. Try again in a moment.');
      })
      .finally(() => setLoading(false));
  }, [address]);
  return { data, loading, errorMessage };
}
