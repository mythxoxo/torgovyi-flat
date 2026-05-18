import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { grossTonForBuyingTokens } from "@meme-launchpad/shared";

import { FileSnapshotRepository } from "../../apps/api/src/services/repository";
import { LaunchpadService } from "../../apps/api/src/services/service";

describe("launchpad flow", () => {
  let tempDir = "";
  let service: LaunchpadService;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "launchpad-e2e-"));
    const repository = new FileSnapshotRepository(path.join(tempDir, "snapshot.json"));
    service = new LaunchpadService(repository, "http://localhost:3000");
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("supports create, buy, sell, and graduation transition", async () => {
    const token = await service.createToken({
      name: "Flow Coin",
      ticker: "FLOW",
      creatorWallet: "EQFLOWCREATOR1111111111111111111111111111111111111"
    });

    await service.buyToken({
      tokenId: token.id,
      wallet: token.creatorWallet,
      tonAmount: 3
    });

    const afterBuy = await service.getToken(token.id);
    const creatorBalance = afterBuy.holderBalances[token.creatorWallet];
    expect(creatorBalance).toBeGreaterThan(0);

    await service.sellToken({
      tokenId: token.id,
      wallet: token.creatorWallet,
      tokenAmount: creatorBalance * 0.2
    });

    let current = await service.getToken(token.id);
    while (current.status === "BONDING") {
      const tokenChunk = Math.min(current.state.remainingBondingSupply, 20_000_000);
      const grossTon = grossTonForBuyingTokens(current.state, tokenChunk, current.creatorTax);
      await service.buyToken({
        tokenId: token.id,
        wallet: "EQFLOWBUYER9999999999999999999999999999999999999999",
        tonAmount: grossTon
      });
      current = await service.getToken(token.id);
    }

    expect(current.status).toBe("GRADUATED");
    expect(current.refundStatus).toBe("CLAIMABLE");
    expect(current.migration.liquidityTon).toBeGreaterThan(0);
    expect(current.migration.lastError).toContain("Mock STON.fi adapter");
  });
});
