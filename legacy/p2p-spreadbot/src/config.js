import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadEnvFile(path.join(projectRoot, ".env"));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function booleanFromEnv(name, fallback) {
  const value = process.env[name];
  if (value == null) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

const starTiers = {
  pro_weekly: {
    id: "pro_weekly",
    label: "Pro Weekly",
    description: "7 days of live spreads and personal Telegram alerts.",
    stars: numberFromEnv("STARS_PRO_WEEKLY", 129),
    durationDays: 7
  },
  pro_monthly: {
    id: "pro_monthly",
    label: "Pro Monthly",
    description: "30 days of live spreads, full feed, and personal Telegram alerts.",
    stars: numberFromEnv("STARS_PRO_MONTHLY", 349),
    durationDays: 30
  }
};

export const config = {
  projectRoot,
  env: process.env.NODE_ENV || "development",
  host: process.env.HOST || "0.0.0.0",
  port: numberFromEnv("PORT", 3000),
  appUrl: process.env.APP_URL || "",
  dataFile: path.resolve(projectRoot, process.env.DATA_FILE || "data/db.json"),
  allowDevAuth: booleanFromEnv("ALLOW_DEV_AUTH", true),
  authMaxAgeSeconds: numberFromEnv("AUTH_MAX_AGE_SECONDS", 86400),
  spreadRefreshMs: numberFromEnv("SPREAD_REFRESH_MS", 30000),
  publicFeedIntervalMs: numberFromEnv("PUBLIC_FEED_INTERVAL_MS", 300000),
  alertCooldownMs: numberFromEnv("ALERT_COOLDOWN_MS", 900000),
  markets: {
    assets: ["USDT", "USDC", "BTC"],
    fiats: ["RUB", "UAH", "KZT", "EUR"],
    venues: [
      { id: "binance_p2p", label: "Binance P2P", type: "p2p" },
      { id: "bybit_p2p", label: "Bybit P2P", type: "p2p" },
      { id: "bestchange", label: "BestChange", type: "aggregator" },
      { id: "spot", label: "Spot Reference", type: "spot" }
    ]
  },
  telegram: {
    botToken: process.env.BOT_TOKEN || "",
    botUsername: process.env.BOT_USERNAME || "",
    transport: process.env.TELEGRAM_TRANSPORT || "polling",
    webhookPath: "/api/telegram/webhook",
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || ""
  },
  tiers: starTiers
};

export function getTierCatalog() {
  return Object.values(config.tiers);
}
