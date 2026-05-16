import {
  PLATFORM_SUPPLY,
  PLATFORM_VESTING_IMMEDIATE_UNLOCK,
  PLATFORM_VESTING_LINEAR_UNLOCK,
  VESTING_DURATION_DAYS
} from "./constants";
import type { PlatformVestingSnapshot } from "./types";
import { clamp, roundNumber } from "./utils";

export const createPlatformVesting = (): PlatformVestingSnapshot => ({
  totalAllocation: PLATFORM_SUPPLY,
  immediateUnlockAmount: PLATFORM_VESTING_IMMEDIATE_UNLOCK,
  linearUnlockAmount: PLATFORM_VESTING_LINEAR_UNLOCK,
  claimedAmount: 0
});

export const claimablePlatformAllocation = (
  vesting: PlatformVestingSnapshot,
  at: Date = new Date()
): number => {
  if (!vesting.graduatedAt) {
    return 0;
  }

  const graduatedAt = new Date(vesting.graduatedAt);
  const elapsedMs = Math.max(0, at.getTime() - graduatedAt.getTime());
  const durationMs = VESTING_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const linearUnlocked = vesting.linearUnlockAmount * clamp(elapsedMs / durationMs, 0, 1);
  const unlocked = vesting.immediateUnlockAmount + linearUnlocked;

  return roundNumber(Math.max(0, unlocked - vesting.claimedAmount), 4);
};
