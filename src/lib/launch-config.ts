export const PRODUCTION_TARGET_TON = 8888;
export const DEFAULT_TEST_TARGET_TON = 5;

export const getLaunchpadTargetTon = () => {
  const raw = process.env.NEXT_PUBLIC_LAUNCHPAD_TARGET_TON || process.env.LAUNCHPAD_TARGET_TON || "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : PRODUCTION_TARGET_TON;
};

export const isTestTargetMode = () => getLaunchpadTargetTon() !== PRODUCTION_TARGET_TON;
