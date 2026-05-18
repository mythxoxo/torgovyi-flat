import { claimablePlatformAllocation, createPlatformVesting } from "@meme-launchpad/shared";

export class PlatformVestingVault {
  public state = createPlatformVesting();

  public markGraduated(at = new Date()): void {
    this.state.graduatedAt = at.toISOString();
  }

  public claimable(at = new Date()): number {
    return claimablePlatformAllocation(this.state, at);
  }

  public claim(amount: number, at = new Date()): number {
    const claimable = this.claimable(at);
    if (amount > claimable) {
      throw new Error("PlatformVestingVault: claim exceeds unlocked amount");
    }

    this.state.claimedAmount += amount;
    return amount;
  }
}
