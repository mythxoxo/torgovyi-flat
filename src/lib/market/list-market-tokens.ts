import { getTokenList } from "../api";
import { listExternalTokens } from "../external-tokens/search";
import type { ExternalTokenRecord } from "../external-tokens/types";
import { getWatchlist } from "../watchlist";
import type { TokenRecord } from "../shared";
import type { MarketFilter, MarketToken } from "./types";

type LaunchpadMarketToken = Extract<MarketToken, { source: "LAUNCHPAD" }>;
type ExternalMarketToken = Extract<MarketToken, { source: "EXTERNAL" }>;

const launchpadToken = (token: TokenRecord): LaunchpadMarketToken => ({ source: "LAUNCHPAD", token });
const externalToken = (token: ExternalTokenRecord): ExternalMarketToken => ({ source: "EXTERNAL", token });

const launchpadFilterForApi = (filter: MarketFilter) => {
  if (filter === "new") return "new";
  if (filter === "volume") return "top-volume";
  return "trending";
};

const topExternalByVolume = () =>
  [...listExternalTokens()].sort((a, b) => (b.volume24hGram ?? 0) - (a.volume24hGram ?? 0));

export async function listMarketTokens(filter: MarketFilter = "all"): Promise<MarketToken[]> {
  const launchpad = await getTokenList(launchpadFilterForApi(filter)).catch(() => [] as TokenRecord[]);
  const watchlist = filter === "watchlist" ? new Set(getWatchlist()) : null;

  const launchpadItems: LaunchpadMarketToken[] = launchpad.map(launchpadToken);
  const externalItems: ExternalMarketToken[] = topExternalByVolume().map(externalToken);

  if (filter === "external") return externalItems;
  if (filter === "all") return [...launchpadItems, ...externalItems];
  if (filter === "launchpad") return launchpadItems;
  if (filter === "listed") return launchpadItems.filter(({ token }) => token.status === "LISTED" || token.status === "GRADUATED_READY");
  if (filter === "graduated") return launchpadItems.filter(({ token }) => token.status === "GRADUATED_READY" || token.status === "LISTED");
  if (filter === "watchlist" && watchlist) {
    const all: MarketToken[] = [...launchpadItems, ...externalItems];
    return all.filter((item) => watchlist.has(item.source === "LAUNCHPAD" ? item.token.id : item.token.address));
  }

  // Launchpad-first rule: launch tabs never mix already listed external STON.fi tokens into launches.
  return launchpadItems;
}
