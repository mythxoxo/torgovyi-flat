import type { FeeBreakdown } from "@meme-launchpad/shared";

export class FeeVault {
  public treasuryTon = 0;
  public creatorClaimables = new Map<string, number>();
  public referralClaimables = new Map<string, number>();
  public creatorTaxBuybackTon = 0;
  public creatorTaxBurnedTon = 0;

  public credit(creatorWallet: string, fees: FeeBreakdown): void {
    this.treasuryTon += fees.platformTon;
    this.creatorClaimables.set(
      creatorWallet,
      (this.creatorClaimables.get(creatorWallet) ?? 0) + fees.creatorTon
    );

    if (fees.referralWallet) {
      this.referralClaimables.set(
        fees.referralWallet,
        (this.referralClaimables.get(fees.referralWallet) ?? 0) + fees.referralTon
      );
    }

    this.creatorTaxBuybackTon += fees.buybackTon;
    this.creatorTaxBurnedTon += fees.burnTon;
  }

  public claimCreator(wallet: string): number {
    const claimable = this.creatorClaimables.get(wallet) ?? 0;
    this.creatorClaimables.set(wallet, 0);
    return claimable;
  }

  public claimReferral(wallet: string): number {
    const claimable = this.referralClaimables.get(wallet) ?? 0;
    this.referralClaimables.set(wallet, 0);
    return claimable;
  }
}
