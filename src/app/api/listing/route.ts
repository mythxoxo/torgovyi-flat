import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { poolAddress?: string; tonAmount?: string; jettonAmount?: string };
  return NextResponse.json({
    ok: true,
    dex: 'dedust',
    mode: 'dry-run',
    status: 'payload scaffold',
    poolAddress: body.poolAddress || null,
    tonAmount: body.tonAmount || null,
    jettonAmount: body.jettonAmount || null,
    warning: 'manual signing required; live DeDust listing not verified in this build'
  });
}
