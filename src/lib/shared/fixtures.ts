import type { LaunchpadSnapshot } from "./types";

export const createDemoSnapshot = (): LaunchpadSnapshot => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  referrals: [],
  tokens: []
});
