import { NextResponse, type NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy-Report-Only": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' https: data: blob:",
    "font-src 'self' https: data:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https:",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; ")
};

const WINDOW_MS = 60_000;
const MAX_API_WRITES_PER_WINDOW = 40;
const buckets = new Map<string, { count: number; resetAt: number }>();

const clientKey = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

const isWriteMethod = (method: string) => ["POST", "PUT", "PATCH", "DELETE"].includes(method);

const rateLimitApiWrite = (request: NextRequest) => {
  if (!request.nextUrl.pathname.startsWith("/api/") || !isWriteMethod(request.method)) return null;
  const key = `${clientKey(request)}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  bucket.count += 1;
  if (bucket.count <= MAX_API_WRITES_PER_WINDOW) return null;
  return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) } });
};

export function middleware(request: NextRequest) {
  const limited = rateLimitApiWrite(request);
  const response = limited || NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
  if (request.nextUrl.pathname.startsWith("/api/")) response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
