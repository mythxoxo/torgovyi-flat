"use client";

import Link from "next/link";
import { useWallet } from "../../components/wallet-context";
import { WalletConnectButton } from "../../components/wallet-connect-button";
import { WalletAssetsPanel } from "../../components/wallet-assets-panel";
import { useUi } from "../../components/page-shell";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const { locale } = useUi();

  if (!wallet) {
    return <div className="space-y-5"><div className="glass-card rounded-[28px] p-8 text-center"><h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Подключи кошелёк, чтобы увидеть TON и jetton балансы." : "Connect wallet to see your TON and jetton balances."}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c6d4ea]">{locale === "ru" ? "Подключение кошелька нужно, чтобы загрузить активы и историю manual launch." : "Wallet connection is required to load wallet assets and manual launch history."}</p><div className="mt-6 flex justify-center"><WalletConnectButton /></div></div></div>;
  }

  return (
    <div className="space-y-5 pb-24">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Кошелёк" : "Wallet"}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{locale === "ru" ? "Мои токены" : "My tokens"}</h1>
      </section>
      <WalletAssetsPanel />
      <div className="glass-card rounded-[24px] p-6 text-center"><h3 className="text-xl font-semibold text-white">{locale === "ru" ? "Токены, созданные через TONK.MEM, пока не найдены" : "No TONK.MEM-created tokens detected yet"}</h3><p className="mt-2 text-sm text-[#8ba3c1]">{locale === "ru" ? "Если ты запустишь токен через manual flow, он появится здесь после синка индексера." : "If you launch a token through the manual flow, it will appear here after indexer sync."}</p><div className="mt-5 flex justify-center"><Link href="/create" className="btn-primary">{locale === "ru" ? "Создать токен" : "Create token"}</Link></div></div>
    </div>
  );
}
