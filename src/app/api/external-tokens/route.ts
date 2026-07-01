import { NextResponse, type NextRequest } from "next/server";
import { listExternalTokensLive, searchExternalTokensLive } from "../../../lib/external-tokens/live";
import { listSnapshotExternalTokens } from "../../../lib/external-tokens/snapshot";

const responseWithTokens = (source: "live-external" | "snapshot-external", tokens: unknown[], note?: string) => NextResponse.json({
  ok: true,
  source,
  tokens,
  note
});

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const snapshot = listSnapshotExternalTokens(query);
  try {
    const liveTokens = query ? await searchExternalTokensLive(query, "all") : await listExternalTokensLive("all");
    if (liveTokens.length > 0) return responseWithTokens("live-external", liveTokens);
    return responseWithTokens("snapshot-external", snapshot, "Live external source returned empty; showing last-known real DEX token identities instead of an empty market.");
  } catch (error) {
    console.warn("Live external token sources failed", error);
    return responseWithTokens("snapshot-external", snapshot, "Live external source is unavailable in this runtime; showing last-known real DEX token identities.");
  }
}
