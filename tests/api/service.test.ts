import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileSnapshotRepository } from "../../apps/api/src/services/repository";
import { LaunchpadService } from "../../apps/api/src/services/service";

describe("launchpad service", () => {
  let tempDir = "";
  let service: LaunchpadService;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "launchpad-service-"));
    const repository = new FileSnapshotRepository(path.join(tempDir, "snapshot.json"));
    service = new LaunchpadService(repository, "http://localhost:3000");
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("creates a token and lists it in new feed", async () => {
    const token = await service.createToken({
      name: "Test Rocket",
      ticker: "TROCK",
      creatorWallet: "EQCREATOR11111111111111111111111111111111111111111"
    });

    const tokens = await service.listTokens("new");
    expect(tokens.some((item) => item.id === token.id)).toBe(true);
  });

  it("routes referral share to the referral wallet when valid", async () => {
    const token = await service.createToken({
      name: "Referral Coin",
      ticker: "REFC",
      creatorWallet: "EQCREATOR22222222222222222222222222222222222222222"
    });

    const user = await service.getUser("EQREFERRAL3333333333333333333333333333333333333333");
    await service.buyToken({
      tokenId: token.id,
      wallet: "EQBUYER444444444444444444444444444444444444444444",
      tonAmount: 2,
      referralCode: user.referralCode
    });

    const updated = await service.getToken(token.id);
    expect(updated.feeVault.referralClaimables[user.wallet]).toBeGreaterThan(0);
  });

  it("claims creator fees and referral fees", async () => {
    const creatorWallet = "EQCREATOR55555555555555555555555555555555555555555";
    const token = await service.createToken({
      name: "Claim Coin",
      ticker: "CLMC",
      creatorWallet
    });

    const referralUser = await service.getUser("EQREFERRAL6666666666666666666666666666666666666666");
    await service.buyToken({
      tokenId: token.id,
      wallet: "EQBUYER777777777777777777777777777777777777777777",
      tonAmount: 3,
      referralCode: referralUser.referralCode
    });

    const creatorClaim = await service.claimCreator(creatorWallet);
    const referralClaim = await service.claimReferral(referralUser.wallet);

    expect(creatorClaim.claimedTon).toBeGreaterThan(0);
    expect(referralClaim.claimedTon).toBeGreaterThan(0);
    expect(creatorClaim.user.creatorClaimableTon).toBe(0);
    expect(referralClaim.user.referralClaimableTon).toBe(0);
  });
});
