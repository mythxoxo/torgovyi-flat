import { NextResponse, type NextRequest } from "next/server";
import { listExternalTokensLive, searchExternalTokensLive } from "../../../lib/external-tokens/live";
import { enrichExternalTokenMetrics } from "../../../lib/external-tokens/metrics";
import { listSnapshotExternalTokens } from "../../../lib/external-tokens/snapshot";

const responseWithTokens = (source: "live-external" | "snapshot-external", tokens: unknown[]) => NextResponse.json({
  ok: true,
  source,
  tokens
});

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const snapshot = listSnapshotExternalTokens(query);
  try {
    const liveTokens = query ? await searchExternalTokensLive(query, "all") : await listExternalTokensLive("all");
    if (liveTokens.length > 0) return responseWithTokens("live-external", await enrichExternalTokenMetrics(liveTokens));
    return responseWithTokens("snapshot-external", await enrichExternalTokenMetrics(snapshot));
  } catch (error) {
    console.warn("Live external token sources failed", error);
    return responseWithTokens("snapshot-external", await enrichExternalTokenMetrics(snapshot));
  }
}
