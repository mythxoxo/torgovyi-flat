"use client";

import { useWallet } from "./wallet-context";
import { useWalletAssets } from "../lib/wallet/use-wallet-assets";
import { useUi } from "./page-shell";
import { WalletConnectButton } from "./wallet-connect-button";

const short = (a: string) => (a ? `${a.slice(0, 6)}...${a.slice(-6)}` : "");

export function WalletAssetsPanel() {
  const { wallet } = useWallet();
  const { t } = useUi();
  const { data, loading } = useWalletAssets(wallet || undefined);

  if (!wallet) {
    return (
      <div className="glass-card rounded-[24px] p-6 text-center">
        <h3 className="text-lg font-semibold text-white">{t.profile.connect}</h3>
        <div className="mt-5 flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[24px] p-5 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{t.nav.profile}</div>
        <div className="mt-1 font-mono text-white">{short(wallet)}</div>
        <div className="mt-2 text-sm text-[#c6d4ea]">{t.profile.subtitle}</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#c6d4ea]">
        TON: {data?.tonBalanceFormatted ? `${data.tonBalanceFormatted} TON` : "—"}
      </div>

      {loading ? <div className="text-sm text-[#8ba3c1]">{t.misc.loadingWallet}</div> : null}
      {data?.ok === false ? <div className="text-sm text-[#8ba3c1]">{t.profile.assetsFallback}</div> : null}

      {data?.ok && data.jettons?.length ? (
        <div className="space-y-2">
          {data.jettons.slice(0, 8).map((j) => (
            <div key={`${j.address}-${j.symbol}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div>
                <div className="text-sm text-white">{j.name}</div>
                <div className="text-xs text-[#8ba3c1]">{j.symbol}</div>
              </div>
              <div className="font-mono text-xs text-white">{j.balanceFormatted}</div>
            </div>
          ))}
        </div>
      ) : !loading && data?.ok !== false ? (
        <div className="text-sm text-[#8ba3c1]">{t.misc.noTokensProfile}</div>
      ) : null}
    </div>
  );
}
