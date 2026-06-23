import { Address } from "@ton/core";
import { getContractState, getFactoryPoolCount, getPoolState } from "./chain";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
const LIVE_POOL_ADDRESS = process.env.LIVE_POOL_ADDRESS || "EQDUYho8-Np3wzUbkbrN36-fCY9utqdjROPmxB0nzpibT6R-";
const LIVE_JETTON_ADDRESS = process.env.LIVE_JETTON_ADDRESS || "EQBq5kppzmz7BJuvQzAW_ZMyXvFhnSPBjyXD_ximwhedL3ca";
const LIVE_BUYER_ADDRESS = process.env.LIVE_BUYER_ADDRESS || process.env.EXAMPLE_CREATOR_ADDRESS || "EQBEz1JfICpZYhsiqDCccu3lTOo5Or91vFOnqiHcdjcddtrx";

const safeAddress = (value: string) => {
  try {
    return Address.parse(value).toString({ bounceable: true, testOnly: false });
  } catch {
    return "";
  }
};

export type LiveProof = {
  factory: {
    address: string;
    deployed: boolean;
    poolCount: number | null;
  };
  pool: {
    address: string;
    deployed: boolean;
    collectedTon: number | null;
    targetTon: number | null;
    soldTokens: number | null;
    creator: string | null;
    jettonMaster: string | null;
    isListed: boolean | null;
    isGraduated: boolean | null;
    lpLock: string | null;
  };
  buyer: {
    address: string;
  };
  jetton: {
    address: string;
  };
  summary: {
    liveBuyProven: boolean;
    buyerJettonsProven: boolean;
    factoryReady: boolean;
  };
};

export async function getLiveProof(): Promise<LiveProof> {
  const factoryAddress = safeAddress(FACTORY_ADDRESS);
  const poolAddress = safeAddress(LIVE_POOL_ADDRESS);
  const jettonAddress = safeAddress(LIVE_JETTON_ADDRESS);
  const buyerAddress = safeAddress(LIVE_BUYER_ADDRESS);

  let factoryDeployed = false;
  let poolCount: number | null = null;
  if (factoryAddress) {
    try {
      const state = await getContractState(factoryAddress);
      factoryDeployed = state.state === "active";
      if (factoryDeployed) {
        poolCount = await getFactoryPoolCount(factoryAddress);
      }
    } catch {
      factoryDeployed = false;
      poolCount = null;
    }
  }

  let poolDeployed = false;
  let poolState: Awaited<ReturnType<typeof getPoolState>> | null = null;
  if (poolAddress) {
    try {
      const state = await getContractState(poolAddress);
      poolDeployed = state.state === "active";
      if (poolDeployed) {
        poolState = await getPoolState(poolAddress);
      }
    } catch {
      poolDeployed = false;
      poolState = null;
    }
  }

  const liveBuyProven = Boolean(poolState && poolState.collectedTon > 0 && poolState.soldTokens > 0);
  const buyerJettonsProven = liveBuyProven && Boolean(jettonAddress && buyerAddress);

  return {
    factory: {
      address: factoryAddress,
      deployed: factoryDeployed,
      poolCount
    },
    pool: {
      address: poolAddress,
      deployed: poolDeployed,
      collectedTon: poolState?.collectedTon ?? null,
      targetTon: poolState?.targetTon ?? null,
      soldTokens: poolState?.soldTokens ?? null,
      creator: poolState?.creator ?? null,
      jettonMaster: poolState?.jettonMaster ?? null,
      isListed: poolState?.isListed ?? null,
      isGraduated: poolState?.isGraduated ?? null,
      lpLock: poolState?.lpLock ?? null
    },
    buyer: {
      address: buyerAddress
    },
    jetton: {
      address: jettonAddress
    },
    summary: {
      liveBuyProven,
      buyerJettonsProven,
      factoryReady: factoryDeployed
    }
  };
}
