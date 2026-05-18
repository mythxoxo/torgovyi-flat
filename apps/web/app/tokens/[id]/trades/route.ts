import { getTrades } from "../../../../lib/server-api";

export const dynamic = "force-dynamic";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => getTrades((await context.params).id);
