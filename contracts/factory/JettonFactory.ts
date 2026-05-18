import { normalizeCreatorTax } from "@meme-launchpad/shared";
import type { CreateTokenInput } from "@meme-launchpad/shared";

import { BondingCurveContract } from "../bonding/BondingCurveContract";
import { JettonMaster } from "../jetton/JettonMaster";
import { FeeVault } from "../vaults/FeeVault";
import { PlatformVestingVault } from "../vaults/PlatformVestingVault";
import { LiquidityMigrator, MockStonFiAdapter } from "../migrator/LiquidityMigrator";

export class JettonFactory {
  public createTokenBundle(input: CreateTokenInput) {
    const creatorTax = normalizeCreatorTax(input.creatorTax);
    const jettonMaster = new JettonMaster({
      name: input.name,
      symbol: input.ticker,
      description: input.description || "",
      image: input.image || ""
    });

    return {
      jettonMaster,
      bondingCurve: new BondingCurveContract(creatorTax),
      feeVault: new FeeVault(),
      platformVestingVault: new PlatformVestingVault(),
      liquidityMigrator: new LiquidityMigrator(new MockStonFiAdapter())
    };
  }
}
