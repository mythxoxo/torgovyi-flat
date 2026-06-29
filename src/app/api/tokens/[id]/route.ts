import type { NextRequest } from "next/server";
import { getToken } from "../../../../lib/server-api";
import { syncTokenRowFromChain } from "../../../../lib/server/token-sync";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const tokenId = decodeURIComponent(id);
  await syncTokenRowFromChain(tokenId).catch(() => undefined);
  return getToken(tokenId);
}
