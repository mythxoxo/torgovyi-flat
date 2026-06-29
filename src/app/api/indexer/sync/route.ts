import { NextResponse, type NextRequest } from "next/server";
import { runIndexer } from "../../../../../indexer";

let lastStartedAt = 0;
const MIN_INTERVAL_MS = 20_000;

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.INDEXER_SHARED_SECRET || "";
  if (!secret) return true;
  const header = request.headers.get("authorization") || "";
  const querySecret = request.nextUrl.searchParams.get("secret") || "";
  return header === `Bearer ${secret}` || querySecret === secret;
};

async function handle(request: NextRequest) {
  try {
    if (!isAuthorized(request)) return json({ ok: false, error: "unauthorized" }, 401);
    const now = Date.now();
    if (now - lastStartedAt < MIN_INTERVAL_MS) return json({ ok: true, skipped: true, reason: "rate_limited", nextAllowedInMs: MIN_INTERVAL_MS - (now - lastStartedAt) });
    lastStartedAt = now;
    const result = await runIndexer();
    return json(result);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "indexer sync failed" }, 500);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) { return handle(request); }
export async function POST(request: NextRequest) { return handle(request); }
