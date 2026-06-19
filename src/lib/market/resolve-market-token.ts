import { getToken } from "../api";
import { resolveExternalTokenLive } from "../external-tokens/live";
import type { MarketToken } from "./types";

export async function resolveMarketToken(idOrAddress: string): Promise<MarketToken | null> {
  const external = await resolveExternalTokenLive(idOrAddress);
  if (external) return { source: "EXTERNAL", token: external };

  try {
    const { token } = await getToken(idOrAddress);
    return { source: "LAUNCHPAD", token };
  } catch {
    return null;
  }
}
