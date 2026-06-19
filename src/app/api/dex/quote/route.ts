import { NextRequest, NextResponse } from "next/server";
import { resolveDexQuote } from "../../../../lib/dex/router";
import type { DexQuoteInput } from "../../../../lib/dex/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<DexQuoteInput>;

    if (!body.userWalletAddress || !body.askAddress || !body.offerUnits) {
      return NextResponse.json({ ok: false, error: "Missing quote input" }, { status: 400 });
    }

    const quote = await resolveDexQuote({
      userWalletAddress: body.userWalletAddress,
      offerAddress: body.offerAddress ?? "ton",
      askAddress: body.askAddress,
      offerUnits: body.offerUnits,
      slippageTolerance: body.slippageTolerance ?? "0.01"
    });

    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Quote failed" }, { status: 500 });
  }
}
