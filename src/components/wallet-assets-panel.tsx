"use client";

import { useWallet } from "./wallet-context";
import { useWalletAssets } from "../lib/wallet/use-wallet-assets";
import { useUi } from "./page-shell";

const short = (a: string) => (a ? `${a.slice(0, 4)}...${a.slice(-4)}` : "");

export function WalletAssetsPanel() {
  const { wallet } = useWallet();
  const { locale } = useUi();
  const { data, loading } = useWalletAssets(wallet || undefined);
  const message = data?.message || data?.reason || "Wallet assets are not available yet.";

  if (!wallet) return <div className="glass-card rounded-[24px] p-5"><h3 className="text-lg font-semibold text-white">{locale === "ru" ? "Подключите кошелёк" : "Connect wallet"}</h3></div>;

  return <div className="glass-card rounded-[24px] p-5 space-y-3"><div><div className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Кошелёк" : "Wallet"}</div><div className="mt-1 font-mono text-white">{short(wallet)}</div></div><div className="text-sm text-[#c6d4ea]">{locale === "ru" ? "TON баланс" : "TON balance"}: {data?.tonBalanceFormatted ? `${data.tonBalanceFormatted} TON` : "—"}</div>{loading ? <div className="text-sm text-[#8ba3c1]">{locale === "ru" ? "Загружаю активы кошелька..." : "Loading wallet assets..."}</div> : null}{data?.ok === false ? <div className="text-sm text-[#8ba3c1]">{locale === 'ru' ? 'Активы кошелька пока недоступны.' : message}</div> : null}{data?.ok && data.jettons?.length ? <div className="space-y-2">{data.jettons.slice(0, 8).map((j) => <div key={`${j.address}-${j.symbol}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"><div><div className="text-sm text-white">{j.name}</div><div className="text-xs text-[#8ba3c1]">{j.symbol}</div></div><div className="font-mono text-xs text-white">{j.balanceFormatted}</div></div>)}</div> : !loading && data?.ok !== false ? <div className="text-sm text-[#8ba3c1]">{locale === "ru" ? "Токены кошелька не найдены." : "No wallet tokens found."}</div> : null}</div>;
}
