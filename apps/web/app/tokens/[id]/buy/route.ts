import type { NextRequest } from "next/server";

import { buyToken } from "../../../../lib/server-api";

export const dynamic = "force-dynamic";

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => buyToken((await context.params).id, request);
