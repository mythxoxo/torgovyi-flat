"use client";

import { useWallet } from "../../components/wallet-context";
import { WalletConnectButton } from "../../components/wallet-connect-button";
import { WalletAssetsPanel } from "../../components/wallet-assets-panel";
import { useUi } from "../../components/page-shell";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const { locale } = useUi();

  if (!wallet) {
    return <div className="space-y-5"><div className="glass-card rounded-[28px] p-8 text-center"><h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Подключите кошелёк, чтобы увидеть свои активы." : "Connect wallet to see your assets."}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c6d4ea]">{locale === "ru" ? "Сайт не хранит средства. Здесь показываются только активы подключённого кошелька." : "The site does not custody funds. Only the connected wallet assets are shown here."}</p><div className="mt-6 flex justify-center"><WalletConnectButton /></div></div></div>;
  }

  return <div className="space-y-5 pb-24"><section><p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Кошелёк" : "Wallet"}</p><h1 className="mt-2 font-display text-3xl font-bold text-white">{locale === "ru" ? "Мои активы" : "My assets"}</h1></section><WalletAssetsPanel /></div>;
}
