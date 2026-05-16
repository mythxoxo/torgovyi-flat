import type { NextRequest } from "next/server";
import { uploadImage } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

export const POST = (request: NextRequest) => uploadImage(request);
