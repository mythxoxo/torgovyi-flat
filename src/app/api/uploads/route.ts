import { NextResponse, type NextRequest } from "next/server";
import { createMediaStorage } from "../../../lib/server/media";

const MAX_IMAGE_BYTES = 2_000_000;
const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const recentUploads = new Map<string, number[]>();

const apiPublicUrl = () => process.env.API_PUBLIC_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload.bin";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const hasPngSignature = (buffer: Buffer) => buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
const hasJpegSignature = (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
const hasWebpSignature = (buffer: Buffer) => buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";

const assertImageSignature = (buffer: Buffer, mime: string) => {
  if (mime === "image/png" && hasPngSignature(buffer)) return;
  if (mime === "image/jpeg" && hasJpegSignature(buffer)) return;
  if (mime === "image/webp" && hasWebpSignature(buffer)) return;
  throw new Error("Image content does not match its declared type");
};

const getMediaStorage = () => createMediaStorage({
  mode: process.env.UPLOAD_STORAGE || "local",
  publicBaseUrl: apiPublicUrl(),
  s3Bucket: process.env.S3_BUCKET || "",
  s3Region: process.env.S3_REGION || "",
  s3AccessKey: process.env.S3_ACCESS_KEY || "",
  s3SecretKey: process.env.S3_SECRET_KEY || "",
  s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL || ""
});

const requireUploadSecret = (request: NextRequest) => {
  const secret = process.env.UPLOAD_SHARED_SECRET || "";
  if (!secret) throw new Error("Upload secret is not configured");
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) throw new Error("Unauthorized");
};

const enforceRateLimit = (request: NextRequest) => {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const hits = (recentUploads.get(key) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) throw new Error("Rate limit exceeded");
  hits.push(now);
  recentUploads.set(key, hits);
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    requireUploadSecret(request);
    enforceRateLimit(request);

    const formData = await request.formData();
    const image = formData.get("image");
    if (!(image instanceof File)) throw new Error("Image file is required");
    if (image.size <= 0) throw new Error("Image file is empty");
    if (image.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 2 MB");
    if (!ALLOWED_IMAGE_MIME.has(image.type)) throw new Error("Only PNG, JPEG, or WEBP images are allowed");

    const buffer = Buffer.from(await image.arrayBuffer());
    assertImageSignature(buffer, image.type);

    const url = await getMediaStorage().storeUploadedImage({
      buffer,
      mimetype: image.type,
      originalname: sanitizeFilename(image.name)
    });
    return json({ url }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message === "Unauthorized" ? 401 : message === "Rate limit exceeded" ? 429 : 400;
    return json({ error: message }, status);
  }
}
