import crypto from "node:crypto";
import { config } from "./config.js";

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function safeJsonParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function validateTelegramInitData(initData) {
  if (!config.telegram.botToken) {
    throw new Error("BOT_TOKEN is required to validate Telegram initData.");
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");

  if (!receivedHash) {
    throw new Error("Missing hash in initData.");
  }

  params.delete("hash");
  params.delete("signature");

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(config.telegram.botToken)
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqualHex(expectedHash, receivedHash)) {
    throw new Error("Invalid Telegram initData signature.");
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    throw new Error("Invalid auth_date in initData.");
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > config.authMaxAgeSeconds) {
    throw new Error("Telegram initData is too old.");
  }

  const rawUser = params.get("user");
  if (!rawUser) {
    throw new Error("Missing user in initData.");
  }

  return {
    user: JSON.parse(rawUser),
    chat: safeJsonParse(params.get("chat")),
    startParam: params.get("start_param") || "",
    queryId: params.get("query_id") || "",
    authDate
  };
}

export function authenticate({ initData, storage }) {
  if (initData) {
    const validated = validateTelegramInitData(initData);
    const user = storage.createOrUpdateFromTelegramProfile(validated.user);
    return { user, context: validated, devMode: false };
  }

  if (config.allowDevAuth) {
    return { user: storage.ensureDevUser(), context: null, devMode: true };
  }

  throw new Error("Unauthorized.");
}
