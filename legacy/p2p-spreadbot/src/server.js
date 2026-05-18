import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config, getTierCatalog } from "./config.js";
import { Storage, normalizeVenues, serializeUser } from "./storage.js";
import { authenticate } from "./auth.js";
import { generateSpreadSnapshot } from "./spread-engine.js";
import { dispatchAlerts } from "./alert-service.js";
import { createTelegramClient } from "./telegram.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function json(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  json(res, 404, { ok: false, error: "Not found" });
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large."));
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON payload."));
      }
    });

    req.on("error", reject);
  });
}

function parseFilters(url) {
  return {
    asset: url.searchParams.get("asset") || "ALL",
    fiat: url.searchParams.get("fiat") || "ALL",
    minSpread: Number(url.searchParams.get("minSpread") || "0"),
    venues: normalizeVenues(url.searchParams.get("venues") || "")
  };
}

async function serveStatic(res, url) {
  let filePath = path.join(publicDir, url.pathname);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    filePath = path.join(publicDir, "index.html");
  }

  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(publicDir)) {
    notFound(res);
    return;
  }

  try {
    const stat = await fs.stat(normalized);
    if (stat.isDirectory()) {
      notFound(res);
      return;
    }

    const ext = path.extname(normalized);
    const type = mimeTypes[ext] || "application/octet-stream";
    const content = await fs.readFile(normalized);
    res.writeHead(200, { "content-type": type });
    res.end(content);
  } catch (error) {
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      notFound(res);
      return;
    }

    json(res, 500, { ok: false, error: error.message });
  }
}

export async function createApp() {
  const storage = new Storage(config.dataFile, {
    publicFeedIntervalMs: config.publicFeedIntervalMs
  });
  await storage.init();

  const telegram = createTelegramClient(storage);

  async function refreshSpreads() {
    const snapshot = generateSpreadSnapshot();
    storage.setSpreads(snapshot.rows, snapshot.refreshedAt);

    await dispatchAlerts({
      storage,
      telegram,
      appUrl: config.appUrl,
      cooldownMs: config.alertCooldownMs,
      spreads: snapshot.rows
    });
  }

  await refreshSpreads();

  const refreshTimer = setInterval(() => {
    refreshSpreads().catch((error) => {
      console.error("Spread refresh failed:", error);
    });
  }, config.spreadRefreshMs);

  if (telegram.isConfigured() && config.telegram.transport === "polling") {
    telegram.startPolling(async (update) => {
      await telegram.processUpdate(update);
    });
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    try {
      if (req.method === "GET" && url.pathname === "/api/health") {
        json(res, 200, {
          ok: true,
          env: config.env,
          botConfigured: telegram.isConfigured(),
          transport: config.telegram.transport
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/session") {
        const body = await readRequestBody(req);
        const { user, devMode } = authenticate({
          initData: body.initData,
          storage
        });

        json(res, 200, {
          ok: true,
          devMode,
          user: serializeUser(user, storage),
          tiers: getTierCatalog()
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/bootstrap") {
        const initData = req.headers["x-telegram-init-data"];
        const { user, devMode } = authenticate({
          initData: typeof initData === "string" ? initData : "",
          storage
        });
        const filters = parseFilters(url);
        const snapshot = storage.getSpreadSnapshot(user, filters);

        json(res, 200, {
          ok: true,
          devMode,
          user: serializeUser(user, storage),
          spreadFeed: snapshot,
          tiers: getTierCatalog(),
          bot: {
            username: config.telegram.botUsername,
            appUrl: config.appUrl
          },
          marketMeta: config.markets
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/settings") {
        const body = await readRequestBody(req);
        const { user } = authenticate({
          initData: body.initData,
          storage
        });

        const updated = storage.saveSettings(user.telegramId, {
          asset: body.asset || user.settings.asset,
          fiat: body.fiat || user.settings.fiat,
          minSpread: Number(body.minSpread ?? user.settings.minSpread),
          venues: normalizeVenues(body.venues || user.settings.venues),
          alertsEnabled:
            typeof body.alertsEnabled === "boolean"
              ? body.alertsEnabled
              : user.settings.alertsEnabled
        });

        json(res, 200, {
          ok: true,
          user: serializeUser(updated, storage)
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/payments/create-invoice") {
        const body = await readRequestBody(req);
        const { user } = authenticate({
          initData: body.initData,
          storage
        });

        if (!telegram.isConfigured()) {
          json(res, 400, {
            ok: false,
            error: "Telegram bot is not configured yet."
          });
          return;
        }

        const invoiceUrl = await telegram.createInvoiceLink({
          tierId: body.tierId,
          telegramId: user.telegramId
        });

        json(res, 200, { ok: true, url: invoiceUrl });
        return;
      }

      if (req.method === "POST" && url.pathname === config.telegram.webhookPath) {
        if (
          config.telegram.webhookSecret &&
          req.headers["x-telegram-bot-api-secret-token"] !== config.telegram.webhookSecret
        ) {
          json(res, 401, { ok: false, error: "Invalid webhook secret." });
          return;
        }

        const body = await readRequestBody(req);
        await telegram.processUpdate(body);
        json(res, 200, { ok: true });
        return;
      }

      if (req.method === "GET") {
        await serveStatic(res, url);
        return;
      }

      notFound(res);
    } catch (error) {
      console.error("Request failed:", error);
      json(res, 400, { ok: false, error: error.message || "Unexpected error" });
    }
  });

  async function close() {
    clearInterval(refreshTimer);
    await storage.flush();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  return { server, storage, close };
}

async function start() {
  const app = await createApp();
  app.server.listen(config.port, config.host, () => {
    console.log(`P2P SpreadBot listening on http://${config.host}:${config.port}`);
  });

  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
