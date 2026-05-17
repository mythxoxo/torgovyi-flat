import Image from "next/image";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { TokenCard } from "./token-card";

function TokenCardSkeleton() {
  return <div className="animate-pulse rounded-xl bg-[#1a2235] aspect-[0.78]" />;
}

export function TokenList({ tokens, loading = false }: { tokens: TokenRecord[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 pb-24 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <Image src="/brand/img_03.jpg" alt="No tokens" width={160} height={160} className="mb-6 opacity-80" />
        <h3 className="mb-2 font-display text-xl font-bold text-white">Пока пусто</h3>
        <p className="mb-6 text-sm text-[#8ba3c1]">Стань первым — запусти мем-токен на TON</p>
        <Link href="/create" className="rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-6 py-3 font-bold text-black">
          🚀 Launch Token
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-24 md:grid-cols-3 lg:grid-cols-4">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
