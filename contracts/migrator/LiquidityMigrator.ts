import { graduationPreview } from "@meme-launchpad/shared";
import type { TokenRecord } from "@meme-launchpad/shared";

export interface StonFiAdapter {
  addLiquidity(token: TokenRecord, tonAmount: number, tokenAmount: number): Promise<{
    lpTokenAddress: string;
  }>;
  lockOrBurnLp(lpTokenAddress: string): Promise<"LOCKED" | "BURNED">;
}

export class MockStonFiAdapter implements StonFiAdapter {
  public async addLiquidity(token: TokenRecord): Promise<{ lpTokenAddress: string }> {
    return {
      lpTokenAddress: `mock_lp_${token.id}`
    };
  }

  public async lockOrBurnLp(): Promise<"LOCKED" | "BURNED"> {
    return "LOCKED";
  }
}

export class LiquidityMigrator {
  public constructor(private readonly adapter: StonFiAdapter = new MockStonFiAdapter()) {}

  public async migrate(token: TokenRecord): Promise<TokenRecord> {
    const preview = graduationPreview(token.state);
    const liquidity = await this.adapter.addLiquidity(
      token,
      preview.reserveAfterTon,
      preview.liquidityTokens
    );
    const lpState = await this.adapter.lockOrBurnLp(liquidity.lpTokenAddress);

    token.migration = {
      ...token.migration,
      adapterStatus: "MIGRATED",
      lpState,
      migratedAt: new Date().toISOString(),
      creatorRefundTon: preview.creatorRefundTon,
      liquidityTon: preview.reserveAfterTon,
      liquidityTokens: preview.liquidityTokens
    };
    return token;
  }
}
