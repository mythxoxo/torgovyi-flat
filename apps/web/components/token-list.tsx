import type { TokenRecord } from "@meme-launchpad/shared";

import { TokenCard } from "./token-card";

export function TokenList({ tokens }: { tokens: TokenRecord[] }) {
  if (tokens.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-mist">
        No tokens in this feed yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
