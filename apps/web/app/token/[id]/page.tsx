import Image from "next/image";

import { BuySellBox } from "../../../components/buy-sell-box";
import { ChartPlaceholder } from "../../../components/chart-placeholder";
import { CopyButton } from "../../../components/copy-button";
import { GraduationPopup } from "../../../components/graduation-popup";
import { TokenBackButton } from "../../../components/token-back-button";
import { getComments, getToken } from "../../../lib/api";

function statusLabel(status: string) {
  return status === "GRADUATED" ? "Вышел" : status === "BONDING" ? "Live" : "Миграция";
}

function timeAgo(value: string): string {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export default async function TokenPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { token } = await getToken(id);
  const comments = await getComments(id);
  const progress = Math.min(Math.round(token.state.progress * 100), 100);

  return (
    <div className="space-y-4 pb-24">
      <TokenBackButton />
      <GraduationPopup progress={progress} tokenName={token.name} />

      <section>
        <div className="flex items-center gap-3 px-4 pt-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#1e3a5f]">
            <Image
              src={token.image || "/brand/img_04.jpg"}
              alt={token.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-syne text-xl font-bold text-white">{token.name}</h1>
            <span className="font-mono text-sm text-[#0088cc]">${token.ticker}</span>
          </div>
          <span className="ml-auto shrink-0 rounded-full border border-[#0088cc]/30 px-2 py-1 text-xs text-[#00c896]">
            {statusLabel(token.status)}
          </span>
        </div>

        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[#1a2235] px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-[#8ba3c1]">
            {token.contractAddresses.jettonMaster.slice(0, 6)}...{token.contractAddresses.jettonMaster.slice(-4)}
          </span>
          <CopyButton value={token.contractAddresses.jettonMaster} />
        </div>

        <div className="glass-card mx-4 mt-3 space-y-2 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ba3c1]">Прогресс до выхода</span>
            <span className="font-mono font-bold text-[#00c896]">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e3a5f]">
            <div className="h-full bg-gradient-to-r from-[#0088cc] to-[#00c896]" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between gap-3 text-xs text-[#8ba3c1]">
            <span>💎 {token.state.reserveTon.toFixed(2)} TON собрано</span>
            <span>цель: 8 888 TON</span>
          </div>
        </div>
      </section>

      <ChartPlaceholder progress={token.state.progress} />
      <BuySellBox token={token} />

      <section className="glass-card mx-4 p-4">
        <h2 className="mb-3 text-lg font-bold text-white">Сделки</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="text-[#8ba3c1]">
              <tr>
                <th className="py-2">Время</th>
                <th className="py-2">Тип</th>
                <th className="py-2">Токены</th>
                <th className="py-2">TON</th>
                <th className="py-2">Кошелёк</th>
              </tr>
            </thead>
            <tbody>
              {token.trades.slice(0, 12).map((trade) => (
                <tr key={trade.id} className="border-t border-[#1e3a5f]">
                  <td className="py-2 text-[#8ba3c1]">{timeAgo(trade.createdAt)}</td>
                  <td className={trade.side === "BUY" ? "py-2 font-bold text-[#00c896]" : "py-2 font-bold text-[#ff4757]"}>
                    {trade.side === "BUY" ? "Покупка" : "Продажа"}
                  </td>
                  <td className="py-2 text-white">{trade.tokenAmount.toFixed(2)}</td>
                  <td className="py-2 text-white">
                    {(trade.side === "BUY" ? trade.tonAmountGross : trade.tonAmountNet).toFixed(2)} TON
                  </td>
                  <td className="py-2 font-mono text-[#8ba3c1]">
                    {trade.wallet.slice(0, 4)}...{trade.wallet.slice(-4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {comments.length > 0 ? (
        <section className="glass-card mx-4 p-4">
          <h2 className="mb-3 text-lg font-bold text-white">Комментарии</h2>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-[#1e3a5f] p-3 text-sm text-[#8ba3c1]">
                <p className="font-mono text-xs text-[#0088cc]">{comment.author}</p>
                <p className="mt-2">{comment.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
