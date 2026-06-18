import type { TokenRecord } from "../shared";
import type { ExternalTokenRecord } from "../external-tokens/types";

export type MarketToken =
  | {
      source: "LAUNCHPAD";
      token: TokenRecord;
    }
  | {
      source: "EXTERNAL";
      token: ExternalTokenRecord;
    };

export type MarketFilter = "all" | "launchpad" | "listed" | "external" | "watchlist" | "trending" | "volume" | "new" | "graduated";
