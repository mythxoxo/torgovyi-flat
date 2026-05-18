import Image from "next/image";

import { getTokens } from "../lib/api";
import { Ticker } from "../components/layout/ticker";
import { MarketView } from "../components/market/market-view";

export default async function HomePage() {
  const tokens = await getTokens("trending");
  const trades = tokens
    .flatMap((token) =>
      token.trades.map((trade) => ({
        ...trade,
        tokenName: `$${token.ticker}`
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  return (
    <main className="pb-24">
      <div className="pointer-events-none fixed inset-0 z-[-1]">
        <Image src="/brand/img_01.jpg" alt="" fill className="object-cover opacity-[0.05]" priority />
      </div>

      <Ticker trades={trades} />
      <MarketView tokens={tokens} />
    </main>
  );
}
