import type { NextRequest } from "next/server";
import { dispatchApiPath } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path?: string[] }> };

const handle = async (request: NextRequest, context: RouteContext) => {
  const { path = [] } = await context.params;
  return dispatchApiPath(path, request, request.method);
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
