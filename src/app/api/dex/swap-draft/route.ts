import { NextRequest, NextResponse } from "next/server";
import { buildStonfiSwapDraft } from "../../../../lib/dex/stonfi-swap-draft";
import type { DexSwapDraftInput } from "../../../../lib/dex/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<DexSwapDraftInput>;

    if (!body.userWalletAddress || !body.askAddress || !body.offerUnits || !body.minAskUnits) {
      return NextResponse.json({ ok: false, error: "Missing swap draft input" }, { status: 400 });
    }

    const draft = await buildStonfiSwapDraft({
      userWalletAddress: body.userWalletAddress,
      offerAddress: body.offerAddress ?? "ton",
      askAddress: body.askAddress,
      offerUnits: body.offerUnits,
      minAskUnits: body.minAskUnits,
      slippageTolerance: body.slippageTolerance ?? "0.01"
    });

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Swap draft failed" }, { status: 500 });
  }
}
