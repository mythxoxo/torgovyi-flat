import { listIndexedTokens } from "../server/indexer-store";
import type { GainerRecord } from "./types";

const compactWallet = (value: string) => value.length > 12 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

export async function listLiveLaunchpadGainers(): Promise<GainerRecord[]> {
  const tokens = await listIndexedTokens("top-volume");
  const live = tokens
    .filter((token) => Number(token.collected_ton) > 0 && Number(token.sold_tokens) > 0)
    .slice(0, 6)
    .map((token) => {
      const entryGram = Math.max(1, Number(token.collected_ton));
      const marketValue = Math.max(entryGram, Number(token.sold_tokens) / 1000);
      const multiple = Number((marketValue / entryGram).toFixed(2));
      return {
        wallet: compactWallet(token.creator),
        token: token.name,
        multiple,
        entryGram,
        valueGram: marketValue,
        source: "live" as const,
        updatedAt: token.updated_at
      };
    });

  return live;
}
