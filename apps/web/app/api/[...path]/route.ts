import type { NextRequest } from "next/server";

import { dispatchApiPath } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => dispatchApiPath((await context.params).path, request, "GET");

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => dispatchApiPath((await context.params).path, request, "POST");
