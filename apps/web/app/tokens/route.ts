import { createToken, listTokens } from "../../lib/server-api";

export const dynamic = "force-dynamic";

export const GET = listTokens;
export const POST = createToken;
