import { getToken } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => getToken((await context.params).id);
