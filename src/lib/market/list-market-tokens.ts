import { getTokenList } from "../api";
import { listExternalTokens } from "../external-tokens/search";
import { getWatchlist } from "../watchlist";
import type { TokenRecord } from "../shared";
import type { MarketFilter, MarketToken } from "./types";

const launchpadToken = (token: TokenRecord): MarketToken => ({ source: "LAUNCHPAD", token });
const externalToken = (token: ReturnType<typeof listExternalTokens>[number]): MarketToken => ({ source: "EXTERNAL", token });

const launchpadFilterForApi = (filter: MarketFilter) => {
  if (filter === "new") return "new";
  if (filter === "volume") return "top-volume";
  return "trending";
};

export async function listMarketTokens(filter: MarketFilter = "all"): Promise<MarketToken[]> {
  const launchpad = await getTokenList(launchpadFilterForApi(filter)).catch(() => [] as TokenRecord[]);
  const external = listExternalTokens();
  const watchlist = filter === "watchlist" ? new Set(getWatchlist()) : null;

  const launchpadItems = launchpad.map(launchpadToken);
  const externalItems = external.map(externalToken);

  const all = [...launchpadItems, ...externalItems];

  if (filter === "launchpad") return launchpadItems;
  if (filter === "external") return externalItems;
  if (filter === "listed") return launchpadItems.filter(({ token }) => token.status === "LISTED" || token.status === "GRADUATED_READY");
  if (filter === "graduated") return launchpadItems.filter(({ token }) => token.status === "GRADUATED_READY" || token.status === "LISTED");
  if (filter === "watchlist" && watchlist) return all.filter((item) => watchlist.has(item.source === "LAUNCHPAD" ? item.token.id : item.token.address));

  return all;
}
