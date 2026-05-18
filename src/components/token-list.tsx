import Image from "next/image";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { TokenCard } from "./token-card";

function TokenCardSkeleton() {
  return <div className="aspect-[0.78] animate-pulse rounded-xl bg-[#1a2235]" />;
}

export function TokenList({ tokens, loading = false, searchQuery = "" }: { tokens: TokenRecord[]; loading?: boolean; searchQuery?: string }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 pb-24">
        {Array.from({ length: 6 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (searchQuery && tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Image src="/brand/img_11.png" alt="Не найдено" width={140} height={140} className="mb-4 opacity-80" />
        <p className="mb-1 font-bold text-white">Ничего не найдено</p>
        <p className="text-sm text-[#8ba3c1]">Попробуй другой запрос</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <Image src="/brand/img_03.png" alt="Нет токенов" width={140} height={140} className="mb-6 opacity-80" />
        <h3 className="mb-2 font-display text-xl font-bold text-white">Пока пусто</h3>
        <p className="mb-6 text-sm text-[#8ba3c1]">Стань первым — запусти мем-токен</p>
        <Link href="/create" className="btn-primary">
          🚀 Запустить токен
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-24">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
