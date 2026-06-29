import { Address, beginCell, storeStateInit, toNano } from "@ton/core";
import { LaunchpadPool } from "../../../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { LPLock } from "../../../build/lp-lock/LPLock_LPLock";
import { JettonMinter, storeChangeOwner, storeConfigureLaunchPhase } from "../../../build/jetton-minter/JettonMinter_JettonMinter";
import { storeCreateToken, storeRegisterPool } from "../../../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

const DEFAULT_QUERY_TTL = 600;
const DEFAULT_MIN_BUY_TON = 0.05;
const DEFAULT_FEE_BPS = 75;
const DEFAULT_TOTAL_SUPPLY = 1_000_000_000n;

type TonConnectMessage = { address: string; amount: string; payload?: string; stateInit?: string };
type TonConnectDraft = { validUntil: number; messages: TonConnectMessage[] };

export type FullLaunchDraftResult = {
  contracts: {
    factory: string;
    bondingCurve: string;
    jettonMaster: string;
    lpLock: string;
  };
  deploymentDraft: TonConnectDraft;
  activationDraft: TonConnectDraft;
  launchFeeTon: number;
  launchFeeTreasury: string;
};

const asMainnet = (address: Address | string) =>
  (typeof address === "string" ? Address.parse(address) : address).toString({ bounceable: true, testOnly: false });

const stateInitBase64 = (init: NonNullable<Awaited<ReturnType<typeof LaunchpadPool.fromInit>>["init"]>) =>
  beginCell().store(storeStateInit(init)).endCell().toBoc().toString("base64");

const commentPayload = (text: string) =>
  beginCell().storeUint(0, 32).storeStringTail(text).endCell().toBoc().toString("base64");

const normalizeTicker = (ticker: string) => ticker.trim().replace(/^\$/g, "").toUpperCase().slice(0, 10);

const resolveLaunchFeeTreasury = () => {
  const value =
    process.env.DEX_PLATFORM_FEE_TREASURY ||
    process.env.LAUNCH_FEE_TREASURY ||
    process.env.TREASURY_ADDRESS ||
    process.env.TREASURY ||
    process.env.treasury ||
    process.env.REFERRAL_TREASURY_ADDRESS ||
    "";
  if (!value.trim()) throw new Error("Launch fee treasury is not configured. Set DEX_PLATFORM_FEE_TREASURY or TREASURY in Vercel.");
  return asMainnet(value.trim());
};

const resolveLaunchFeeTon = () => {
  const value = Number(process.env.LAUNCH_FEE_TON || "0.25");
  if (!Number.isFinite(value) || value <= 0 || value > 50) throw new Error("LAUNCH_FEE_TON must be > 0 and <= 50");
  return value;
};

export async function prepareFullLaunchDraft(input: {
  factoryAddress: string;
  creatorAddress: string;
  name: string;
  ticker: string;
  description?: string;
  imageUrl?: string;
  targetTon: number;
  minBuyTon?: number;
  feeBps?: number;
}): Promise<FullLaunchDraftResult> {
  const factory = asMainnet(input.factoryAddress);
  const creator = Address.parse(input.creatorAddress);
  const ticker = normalizeTicker(input.ticker);
  const validUntil = Math.floor(Date.now() / 1000) + DEFAULT_QUERY_TTL;
  const targetTon = input.targetTon === 8888 ? 8888 : 5;
  const minBuyTon = input.minBuyTon && input.minBuyTon > 0 ? input.minBuyTon : DEFAULT_MIN_BUY_TON;
  const feeBps = Number.isInteger(input.feeBps) ? Math.max(0, Math.min(1000, Number(input.feeBps))) : DEFAULT_FEE_BPS;
  const launchFeeTreasury = resolveLaunchFeeTreasury();
  const launchFeeTon = resolveLaunchFeeTon();

  const lpLock = await LPLock.fromInit(creator, 0n, true);
  const minter = await JettonMinter.fromInit(0n, creator, beginCell().endCell(), creator, false);
  const pool = await LaunchpadPool.fromInit(creator, minter.address, lpLock.address, toNano(String(targetTon)));
  if (!lpLock.init || !minter.init || !pool.init) throw new Error("launch state init generation failed");

  const createTokenPayload = beginCell().store(storeCreateToken({
    $$type: "CreateToken",
    name: input.name.trim(),
    symbol: ticker,
    description: input.description?.trim() || "",
    imageUrl: input.imageUrl?.trim() || "",
    totalSupply: DEFAULT_TOTAL_SUPPLY,
    creator,
    curveTarget: toNano(String(targetTon)),
    minBuy: toNano(String(minBuyTon)),
    feeBps: BigInt(feeBps)
  })).endCell().toBoc().toString("base64");

  const configurePayload = beginCell().store(storeConfigureLaunchPhase({
    $$type: "ConfigureLaunchPhase",
    queryId: 0n,
    pool: pool.address,
    transfersEnabled: false
  })).endCell().toBoc().toString("base64");

  const changeOwnerPayload = beginCell().store(storeChangeOwner({
    $$type: "ChangeOwner",
    queryId: 0n,
    newOwner: pool.address
  })).endCell().toBoc().toString("base64");

  const registerPoolPayload = beginCell().store(storeRegisterPool({
    $$type: "RegisterPool",
    pool: pool.address,
    jettonMaster: minter.address,
    creator
  })).endCell().toBoc().toString("base64");

  const activationMessages: TonConnectMessage[] = [
    { address: asMainnet(minter.address), amount: toNano("0.05").toString(), payload: configurePayload },
    { address: asMainnet(minter.address), amount: toNano("0.05").toString(), payload: changeOwnerPayload },
    { address: factory, amount: toNano("0.15").toString(), payload: registerPoolPayload },
    { address: launchFeeTreasury, amount: toNano(String(launchFeeTon)).toString(), payload: commentPayload(`TONS launch fee ${ticker}`) }
  ];

  return {
    contracts: {
      factory,
      bondingCurve: asMainnet(pool.address),
      jettonMaster: asMainnet(minter.address),
      lpLock: asMainnet(lpLock.address)
    },
    deploymentDraft: {
      validUntil,
      messages: [
        { address: factory, amount: toNano("0.15").toString(), payload: createTokenPayload },
        { address: asMainnet(lpLock.address), amount: toNano("0.05").toString(), stateInit: stateInitBase64(lpLock.init) },
        { address: asMainnet(minter.address), amount: toNano("0.12").toString(), stateInit: stateInitBase64(minter.init) },
        { address: asMainnet(pool.address), amount: toNano("0.12").toString(), stateInit: stateInitBase64(pool.init) }
      ]
    },
    activationDraft: { validUntil, messages: activationMessages },
    launchFeeTon,
    launchFeeTreasury
  };
}
