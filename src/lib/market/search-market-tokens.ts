import type { MarketFilter, MarketToken } from "./types";
import { listMarketTokens } from "./list-market-tokens";

export async function searchMarketTokens(query: string, filter: MarketFilter = "all"): Promise<MarketToken[]> {
  const tokens = await listMarketTokens(filter);
  const q = query.trim().toLowerCase();
  if (!q) return tokens;

  return tokens.filter((item) => {
    if (item.source === "LAUNCHPAD") {
      const token = item.token;
      const hay = [token.name, token.ticker, token.id, token.status, token.contractAddresses?.jettonMaster ?? "", token.contractAddresses?.bondingCurve ?? "", token.migration?.dedustPoolAddress ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    }

    const token = item.token;
    const hay = [token.name, token.symbol, token.address, token.poolAddress ?? "", token.primaryDex ?? "", token.dexes.join(" ")].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
