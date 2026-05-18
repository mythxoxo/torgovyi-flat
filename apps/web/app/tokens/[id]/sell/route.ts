import type { NextRequest } from "next/server";

import { sellToken } from "../../../../lib/server-api";

export const dynamic = "force-dynamic";

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => sellToken((await context.params).id, request);
