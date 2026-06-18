import { getToken } from "../api";
import { resolveExternalToken } from "../external-tokens/search";
import type { MarketToken } from "./types";

export async function resolveMarketToken(idOrAddress: string): Promise<MarketToken | null> {
  const external = resolveExternalToken(idOrAddress);
  if (external) return { source: "EXTERNAL", token: external };

  try {
    const { token } = await getToken(idOrAddress);
    return { source: "LAUNCHPAD", token };
  } catch {
    return null;
  }
}
