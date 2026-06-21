import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { poolAddress?: string; tonAmount?: string; jettonAmount?: string };
  return NextResponse.json({
    ok: true,
    mode: 'dry-run',
    status: 'migration scaffold',
    poolAddress: body.poolAddress || null,
    tonAmount: body.tonAmount || null,
    jettonAmount: body.jettonAmount || null,
    warning: 'Post-migration unlock and live migration proof are still pending in this build.'
  });
}
