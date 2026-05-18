import { getUser } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ wallet: string }> }
) => getUser((await context.params).wallet);
