import type { MarketToken } from "../lib/market/types";
import { ExternalTokenCard } from "./external-token-card";
import { LaunchpadTokenCard } from "./launchpad-token-card";

export function MarketTokenCard({ marketToken }: { marketToken: MarketToken }) {
  return marketToken.source === "EXTERNAL"
    ? <ExternalTokenCard token={marketToken.token} />
    : <LaunchpadTokenCard token={marketToken.token} />;
}
