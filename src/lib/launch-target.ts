import { toNano } from "@ton/core";
import { getLaunchpadTargetTon, PRODUCTION_TARGET_TON } from "./launch-config";

export const getLaunchpadTargetTonValue = () => getLaunchpadTargetTon();
export const getLaunchpadTargetNano = () => toNano(String(getLaunchpadTargetTonValue()));
export const isProductionTarget = () => getLaunchpadTargetTonValue() === PRODUCTION_TARGET_TON;
