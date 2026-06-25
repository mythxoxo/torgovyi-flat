import { quoteDedust } from "../dedust/quote";
import { quoteStonfi } from "../stonfi/quote";
import type { DexQuote, DexQuoteRequest, ExternalDex } from "./types";

const supported: ExternalDex[] = ["dedust", "stonfi"];

export async function quoteExternalDex(input: DexQuoteRequest): Promise<DexQuote[]> {
  const requested = input.platforms && input.platforms.length > 0 ? input.platforms : supported;
  const platforms = requested.filter((dex) => supported.includes(dex));
  const quotes: DexQuote[] = [];

  for (const dex of platforms) {
    if (dex === "dedust") {
      quotes.push(await quoteDedust({ ...input, platforms: ["dedust"] }));
    }
    if (dex === "stonfi") {
      quotes.push(await quoteStonfi({ ...input, platforms: ["stonfi"] }));
    }
  }

  return quotes;
}
