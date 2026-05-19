import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { TokenCard } from "./token-card";

function TokenCardSkeleton() {
  return <div className="aspect-[0.84] animate-pulse rounded-[24px] bg-[#121d30]" />;
}

export function TokenList({ tokens, loading = false, searchQuery = "" }: { tokens: TokenRecord[]; loading?: boolean; searchQuery?: string }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (searchQuery && tokens.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Search</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-white">Nothing found</h3>
        <p className="mt-3 text-sm leading-6 text-[#c6d4ea]">Try another token name or ticker.</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Market pending</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-white">No live tokens yet</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#c6d4ea]">Mainnet launch proof is pending. The first tokens will appear here after manual Factory deploy, token-flow deploy, and indexer sync.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/create" className="btn-primary text-center">Create test token</Link>
          <Link href="/technical-status" className="btn-secondary text-center text-white">View status</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
