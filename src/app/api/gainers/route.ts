import { NextResponse } from "next/server";
import { listFallbackGainers } from "../../../lib/gainers/fallback";

export async function GET() {
  return NextResponse.json({
    ok: true,
    source: "fallback",
    records: listFallbackGainers(),
    note: "Live launchpad trader multiples require real post-launch trade/PnL indexing."
  });
}
