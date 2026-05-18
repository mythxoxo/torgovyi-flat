import path from "node:path";

import cors from "cors";
import express from "express";
import multer from "multer";

import { apiEnv } from "./env.js";
import { createSnapshotRepository, resolveWorkspacePath } from "./services/repository.js";
import { createMediaStorage } from "./services/media.js";
import { LaunchpadService } from "./services/service.js";

const repository = createSnapshotRepository(apiEnv.databaseUrl, apiEnv.dataFile);
const mediaStorage = createMediaStorage({
  mode: apiEnv.uploadStorage,
  publicBaseUrl: apiEnv.publicUrl,
  s3Bucket: apiEnv.s3Bucket,
  s3Region: apiEnv.s3Region,
  s3AccessKey: apiEnv.s3AccessKey,
  s3SecretKey: apiEnv.s3SecretKey,
  s3PublicBaseUrl: apiEnv.s3PublicBaseUrl
});
const service = new LaunchpadService(repository, apiEnv.telegramWebAppUrl, mediaStorage);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(resolveWorkspacePath("data", "uploads")));
app.use((request, _response, next) => {
  if (request.url === "/api") {
    request.url = "/health";
  } else if (request.url.startsWith("/api/")) {
    request.url = request.url.slice(4);
  }
  next();
});

app.get("/health", async (_request, response) => {
  response.json({
    ok: true,
    service: "launchpad-api",
    storage: apiEnv.databaseUrl ? "postgres" : "file",
    uploadStorage: apiEnv.uploadStorage,
    timestamp: new Date().toISOString()
  });
});

app.post("/uploads", upload.single("image"), async (request, response) => {
  try {
    if (!request.file) {
      throw new Error("Image file is required");
    }

    const imageUrl = await mediaStorage.storeUploadedImage({
      buffer: request.file.buffer,
      mimetype: request.file.mimetype,
      originalname: request.file.originalname
    });

    response.status(201).json({
      url: imageUrl
    });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/tokens", async (request, response) => {
  try {
    const filter =
      typeof request.query.filter === "string" ? request.query.filter : "trending";
    const tokens = await service.listTokens(
      filter as "trending" | "new" | "almost-graduated" | "graduated" | "top-volume"
    );
    response.json(tokens);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/tokens", async (request, response) => {
  try {
    const token = await service.createToken(request.body);
    response.status(201).json(token);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/tokens/:id", async (request, response) => {
  try {
    const token = await service.getToken(request.params.id);
    response.json({
      token,
      shareUrl: service.buildShareUrl(token),
      referralHint: "Pass referral code on buy/sell to route 0.15% to the referrer."
    });
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/tokens/:id/trades", async (request, response) => {
  try {
    response.json(await service.getTrades(request.params.id));
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/tokens/:id/comments", async (request, response) => {
  try {
    response.json(await service.getComments(request.params.id));
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/tokens/:id/buy", async (request, response) => {
  try {
    const token = await service.buyToken({
      tokenId: request.params.id,
      wallet: request.body.wallet,
      tonAmount: Number(request.body.tonAmount),
      referralCode: request.body.referralCode,
      slippageBps: Number(request.body.slippageBps ?? 500)
    });
    response.json(token);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/tokens/:id/sell", async (request, response) => {
  try {
    const token = await service.sellToken({
      tokenId: request.params.id,
      wallet: request.body.wallet,
      tokenAmount: Number(request.body.tokenAmount),
      referralCode: request.body.referralCode,
      slippageBps: Number(request.body.slippageBps ?? 500)
    });
    response.json(token);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/referral/resolve", async (request, response) => {
  try {
    const result = await service.resolveReferral(request.body.code, request.body.wallet);
    response.json(result);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/claim", async (request, response) => {
  try {
    const { wallet, type, tokenId } = request.body as {
      wallet: string;
      type: "creator" | "referral" | "refund";
      tokenId?: string;
    };

    if (type === "creator") {
      response.json(await service.claimCreator(wallet));
      return;
    }

    if (type === "referral") {
      response.json(await service.claimReferral(wallet));
      return;
    }

    if (type === "refund") {
      if (!tokenId) {
        throw new Error("tokenId is required for refund claims");
      }
      response.json(await service.claimRefund(wallet, tokenId));
      return;
    }

    throw new Error("Unsupported claim type");
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/user/:wallet", async (request, response) => {
  try {
    const result = await service.getUser(request.params.wallet);
    response.json(result);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

if (!process.env.VERCEL) {
  app.listen(apiEnv.port, apiEnv.host, () => {
    console.log(`Launchpad API listening on ${apiEnv.publicUrl}`);
    console.log(`Static uploads served from ${path.join(resolveWorkspacePath("data"), "uploads")}`);
  });
}

export default app;
