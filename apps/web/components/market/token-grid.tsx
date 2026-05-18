import type { TokenRecord } from "@meme-launchpad/shared";
import Image from "next/image";
import Link from "next/link";

function timeAgo(value: string): string {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

function StatusBadge({ status }: { status: TokenRecord["status"] }) {
  const label = status === "GRADUATED" ? "Вышел" : status === "BONDING" ? "Live" : "Миграция";

  return (
    <span className="rounded-full border border-[#0088cc]/30 bg-[#0a0f1a]/80 px-2 py-1 text-[10px] font-bold uppercase text-[#00c896]">
      {label}
    </span>
  );
}

function TokenCard({ token }: { token: TokenRecord }) {
  const progress = Math.min(Math.round(token.state.progress * 100), 100);

  return (
    <Link
      href={`/token/${token.id}`}
      className="glass-card block overflow-hidden transition-all hover:border-[#0088cc]/40 active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} fill className="object-cover" unoptimized />
        <div className="absolute right-2 top-2">
          <StatusBadge status={token.status} />
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-white">{token.name}</span>
          <span className="shrink-0 font-mono text-xs text-[#8ba3c1]">${token.ticker}</span>
        </div>

        {token.description ? <p className="line-clamp-1 text-xs text-[#8ba3c1]">{token.description}</p> : null}

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e3a5f]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0088cc] to-[#00c896] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-[#8ba3c1]">
          <span>{progress}% до выхода</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-[#00c896]">💎 {token.state.marketCapTon.toFixed(2)} TON</span>
          <span className="text-[#8ba3c1]">👥 {token.holderCount}</span>
        </div>

        <div className="text-xs text-[#8ba3c1]">{timeAgo(token.createdAt)}</div>
      </div>
    </Link>
  );
}

export function TokenGrid({ tokens, hasQuery }: { tokens: TokenRecord[]; hasQuery?: boolean }) {
  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Image
          src={hasQuery ? "/brand/img_11.jpg" : "/brand/img_03.jpg"}
          alt={hasQuery ? "Не найдено" : "Нет токенов"}
          width={hasQuery ? 140 : 160}
          height={hasQuery ? 140 : 160}
          className="mb-4 rounded-2xl object-cover opacity-90"
        />
        {hasQuery ? (
          <>
            <p className="mb-1 font-bold text-white">Ничего не найдено</p>
            <p className="text-sm text-[#8ba3c1]">Попробуй другой запрос</p>
          </>
        ) : (
          <>
            <h3 className="mb-2 font-syne text-xl font-bold text-white">Пока пусто</h3>
            <p className="mb-6 text-sm text-[#8ba3c1]">Стань первым — запусти мем-токен</p>
            <Link href="/create" className="rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-5 py-3 font-bold text-black">
              🚀 Запустить токен
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
