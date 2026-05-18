import type { ListingConfigView } from "./onchain";

const STONFI_API = "https://api.ston.fi";

export interface StonfiListingParams {
  routerAddress: string;
  pTonAddress: string;
  poolAddress: string;
  jettonMaster: string;
  tonAmount: string;
  jettonAmount: string;
  lpLockAddress: string;
}

export interface StonfiListingPreview {
  ok: boolean;
  request: StonfiListingParams;
  simulation?: unknown;
  warnings: string[];
}

export const assertListingPreconditions = (input: {
  isGraduated: boolean;
  isListed: boolean;
  collectedTon: number;
  targetTon: number;
  jettonMaster: string;
  lpLockAddress?: string;
}) => {
  if (!input.isGraduated || input.collectedTon < input.targetTon) {
    throw new Error("Pool is not graduated on-chain");
  }
  if (input.isListed) {
    throw new Error("Pool is already listed");
  }
  if (!input.jettonMaster) {
    throw new Error("Jetton master address is missing");
  }
  if (!input.lpLockAddress) {
    throw new Error("LP lock address is missing");
  }
};

export const buildListingParams = (
  view: ListingConfigView,
  amounts: { tonAmount: string; jettonAmount: string },
  env: { routerAddress: string; pTonAddress: string }
): StonfiListingParams => ({
  routerAddress: env.routerAddress,
  pTonAddress: env.pTonAddress,
  poolAddress: view.poolAddress,
  jettonMaster: view.jettonMaster,
  tonAmount: amounts.tonAmount,
  jettonAmount: amounts.jettonAmount,
  lpLockAddress: view.lpLockAddress || ""
});

export const previewStonfiListing = async (
  params: StonfiListingParams
): Promise<StonfiListingPreview> => {
  const warnings: string[] = [];
  let simulation: unknown;

  try {
    const response = await fetch(`${STONFI_API}/v1/assets`);
    if (!response.ok) {
      warnings.push(`STON.fi assets probe failed: ${response.status}`);
    } else {
      simulation = { assetsProbe: true };
    }
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "STON.fi probe failed");
  }

  return {
    ok: warnings.length === 0,
    request: params,
    simulation,
    warnings
  };
};
