import type { DexQuote, DexQuoteInput } from "./types";
import { quoteStonfiTonToJetton } from "./stonfi-quote";

export async function resolveDexQuote(input: DexQuoteInput): Promise<DexQuote> {
  if (process.env.NEXT_PUBLIC_STONFI_ENABLED === "false") {
    throw new Error("STON.fi quote is disabled");
  }

  return quoteStonfiTonToJetton(input);
}
