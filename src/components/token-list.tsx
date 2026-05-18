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
      <div className="px-4 py-10 text-center">
        <div className="glass-card relative overflow-hidden rounded-[28px] p-8">
          <div className="absolute inset-0">
            <Image src="/brand/img_11.jpg" alt="Не найдено" fill className="object-cover opacity-28" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.72),rgba(6,12,24,0.94))]" />
          </div>
          <div className="relative mx-auto max-w-sm">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">Search miss</p>
            <p className="mb-2 font-display text-2xl font-bold text-white">Ничего не найдено</p>
            <p className="text-sm leading-6 text-[#c4d7ef]">Попробуй другой запрос — робот ничего не раскопал.</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="glass-card relative overflow-hidden rounded-[28px] p-8">
          <div className="absolute inset-0">
            <Image src="/brand/img_03.jpg" alt="Нет токенов" fill className="object-cover opacity-28" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.72),rgba(6,12,24,0.94))]" />
          </div>
          <div className="relative mx-auto max-w-sm">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">Market empty state</p>
            <h3 className="mb-2 font-display text-2xl font-bold text-white">Пока пусто</h3>
            <p className="mb-6 text-sm leading-6 text-[#c4d7ef]">Стань первым и закинь в маркет токен, который реально хочется открыть.</p>
            <Link href="/create" className="btn-primary">
              🚀 Запустить токен
            </Link>
          </div>
        </div>
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
