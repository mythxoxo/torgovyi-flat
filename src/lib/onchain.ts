import { Address, beginCell, toNano } from "@ton/core";
import type { CreatorTaxConfig } from "./shared";
import { storeCreateToken } from "../../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { storeBuy } from "../../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { storeJettonTransfer } from "../../build/jetton-minter/JettonMinter_JettonMinter";
import { getLaunchpadTargetTon } from "./launch-config";

export const BONDING_TARGET_TON = getLaunchpadTargetTon();
export const MIN_BUY_TON = 0.05;
export const DEFAULT_QUERY_TTL = 300;

export interface TonTransactionDraft {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
  }>;
}

export interface CurveConfig {
  targetTon: number;
  minBuyTon: number;
  feeBps: number;
}

export interface CreateTokenDraftInput {
  factoryAddress: string;
  creatorAddress: string;
  name: string;
  ticker: string;
  description?: string;
  imageUrl?: string;
  totalSupply: bigint;
  creatorTax?: Partial<CreatorTaxConfig>;
  curveConfig?: Partial<CurveConfig>;
}

export interface BuyDraftInput {
  poolAddress: string;
  tonAmount: number;
  minTokensOut?: bigint;
  referralAddress?: string;
}

export interface SellDraftInput {
  userJettonWalletAddress: string;
  poolAddress: string;
  tokenAmount: bigint;
  minTonOutNano?: bigint;
}

export interface ListingConfigView {
  poolAddress: string;
  jettonMaster: string;
  lpLockAddress?: string;
  dedustPoolAddress?: string;
}

export const isTonAddress = (value: string): boolean => {
  try {
    Address.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const toMainnetAddress = (value: string): string =>
  Address.parse(value).toString({ bounceable: true, testOnly: false });

const toBase64 = (cell: ReturnType<typeof beginCell> | { endCell(): { toBoc(): Buffer } }) =>
  cell.endCell().toBoc().toString("base64");

export const buildCreateTokenDraft = ({
  factoryAddress,
  creatorAddress,
  name,
  ticker,
  description = "",
  imageUrl = "",
  totalSupply,
  curveConfig
}: CreateTokenDraftInput): TonTransactionDraft => {
  const payload = beginCell().store(storeCreateToken({
    $$type: "CreateToken",
    name,
    symbol: ticker,
    description,
    imageUrl,
    totalSupply,
    creator: Address.parse(creatorAddress),
    curveTarget: toNano(String(curveConfig?.targetTon ?? BONDING_TARGET_TON)),
    minBuy: toNano(String(curveConfig?.minBuyTon ?? MIN_BUY_TON)),
    feeBps: BigInt(curveConfig?.feeBps ?? 75)
  }));

  return {
    validUntil: Math.floor(Date.now() / 1000) + DEFAULT_QUERY_TTL,
    messages: [
      {
        address: toMainnetAddress(factoryAddress),
        amount: toNano("0.35").toString(),
        payload: toBase64(payload)
      }
    ]
  };
};

export const buildBuyDraft = ({
  poolAddress,
  tonAmount,
  minTokensOut = 0n,
  referralAddress
}: BuyDraftInput): TonTransactionDraft => ({
  validUntil: Math.floor(Date.now() / 1000) + DEFAULT_QUERY_TTL,
  messages: [
    {
      address: toMainnetAddress(poolAddress),
      amount: toNano(String(tonAmount)).toString(),
      payload: beginCell().store(storeBuy({
        $$type: "Buy",
        referral: referralAddress ? Address.parse(referralAddress) : null,
        minTokensOut
      })).endCell().toBoc().toString("base64")
    }
  ]
});

export const buildSellDraft = ({
  userJettonWalletAddress,
  poolAddress,
  tokenAmount,
  minTonOutNano = 1n
}: SellDraftInput): TonTransactionDraft => {
  const forwardPayload = beginCell()
    .storeUint(0x7362d09c, 32)
    .storeUint(0, 64)
    .storeCoins(minTonOutNano)
    .endCell();

  const payload = beginCell().store(storeJettonTransfer({
    $$type: "JettonTransfer",
    queryId: 0n,
    amount: tokenAmount,
    destination: Address.parse(poolAddress),
    responseDestination: Address.parse(poolAddress),
    customPayload: null,
    forwardTonAmount: toNano("0.05"),
    forwardPayload: forwardPayload.beginParse()
  })).endCell().toBoc().toString("base64");

  return {
    validUntil: Math.floor(Date.now() / 1000) + DEFAULT_QUERY_TTL,
    messages: [
      {
        address: toMainnetAddress(userJettonWalletAddress),
        amount: toNano("0.12").toString(),
        payload
      }
    ]
  };
};
