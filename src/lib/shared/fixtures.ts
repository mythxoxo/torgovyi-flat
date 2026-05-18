import {
  CREATION_FEE_TON,
  DEFAULT_STONFI_ROUTER,
  GRADUATION_FEE_TON,
  LIQUIDITY_SUPPLY
} from "./constants";
import { normalizeCreatorTax } from "./creator-tax";
import {
  createInitialBondingState,
  graduationPreview,
  grossTonForBuyingTokens,
  quoteBuy,
  quoteSell
} from "./curve";
import type {
  CreateTokenInput,
  LaunchpadSnapshot,
  ReferralEntry,
  TokenRecord,
  TradeRecord
} from "./types";
import {
  createTokenImageDataUri,
  generateReferralCode,
  makeWallet,
  refreshTokenDerivedFields,
  roundNumber,
  slugifyTokenId
} from "./utils";
import { createPlatformVesting } from "./vesting";

const palette = [
  ["#22d3ee", "#0f172a"],
  ["#fb7185", "#7c3aed"],
  ["#f59e0b", "#7c2d12"],
  ["#10b981", "#0f766e"],
  ["#60a5fa", "#1d4ed8"],
  ["#f97316", "#831843"]
] as const;

const makeFeeVault = () => ({
  treasuryTon: 0,
  creatorClaimables: {},
  referralClaimables: {},
  creatorClaimedTon: {},
  referralClaimedTon: {},
  creatorTaxBuybackTon: 0,
  creatorTaxBurnedTon: 0
});

const makeContractAddresses = (id: string) => ({
  factory: `factory_${id}`,
  jettonMaster: `jetton_${id}`,
  bondingCurve: `bonding_${id}`,
  feeVault: `fees_${id}`,
  platformVestingVault: `vesting_${id}`,
  liquidityMigrator: `migrator_${id}`
});

const buildTokenRecord = (input: CreateTokenInput, createdAt: string, paletteIndex: number): TokenRecord => {
  const id = slugifyTokenId(input.ticker, input.name);
  const [primary, accent] = palette[paletteIndex % palette.length] ?? palette[0];
  const creatorTax = normalizeCreatorTax(input.creatorTax);

  return refreshTokenDerivedFields({
    id,
    name: input.name,
    ticker: input.ticker.toUpperCase(),
    image: input.image || createTokenImageDataUri(input.ticker, primary, accent),
    description: input.description || `${input.name} launched from the TON meme launchpad MVP.`,
    creatorWallet: input.creatorWallet,
    creatorTelegramId: input.creatorTelegramId,
    links: {
      telegram: input.telegramLink,
      twitter: input.twitterLink,
      website: input.websiteLink
    },
    status: "BONDING",
    metadataStatus: "READY",
    createdAt,
    updatedAt: createdAt,
    creationFeeEscrowTon: CREATION_FEE_TON,
    refundStatus: "LOCKED",
    creatorTax,
    state: createInitialBondingState(new Date(createdAt)),
    trades: [],
    comments: [],
    holderBalances: {},
    holderCount: 0,
    topHolders: [],
    creatorPerformance: {
      boughtTon: 0,
      soldTon: 0
    },
    feeVault: makeFeeVault(),
    platformVesting: createPlatformVesting(),
    migration: {
      adapterStatus: "MOCK_READY",
      routerAddress: DEFAULT_STONFI_ROUTER,
      lpState: "NONE",
      graduationFeeTon: GRADUATION_FEE_TON,
      creatorRefundTon: 0,
      liquidityTon: 0,
      liquidityTokens: LIQUIDITY_SUPPLY
    },
    contractAddresses: makeContractAddresses(id)
  });
};

const appendTrade = (token: TokenRecord, trade: Omit<TradeRecord, "id" | "createdAt">): TokenRecord => {
  const nextTrade: TradeRecord = {
    ...trade,
    id: `${token.id}-trade-${token.trades.length + 1}`,
    createdAt: new Date(
      new Date(token.createdAt).getTime() + token.trades.length * 60_000
    ).toISOString()
  };

  token.trades.push(nextTrade);
  token.updatedAt = nextTrade.createdAt;
  return token;
};

const applyBuyFixture = (
  token: TokenRecord,
  grossTon: number,
  wallet: string,
  referral?: ReferralEntry
) => {
  const quote = quoteBuy(token.state, grossTon, token.creatorTax, referral?.wallet, new Date(token.updatedAt));
  token.state = quote.newState;
  token.holderBalances[wallet] = roundNumber((token.holderBalances[wallet] ?? 0) + quote.tokenAmount, 6);
  token.feeVault.treasuryTon = roundNumber(token.feeVault.treasuryTon + quote.feeBreakdown.platformTon, 9);
  token.feeVault.creatorClaimables[token.creatorWallet] = roundNumber(
    (token.feeVault.creatorClaimables[token.creatorWallet] ?? 0) + quote.feeBreakdown.creatorTon,
    9
  );

  if (referral) {
    token.feeVault.referralClaimables[referral.wallet] = roundNumber(
      (token.feeVault.referralClaimables[referral.wallet] ?? 0) + quote.feeBreakdown.referralTon,
      9
    );
    referral.totalVolumeTon = roundNumber(referral.totalVolumeTon + grossTon, 9);
    referral.earnedTon = roundNumber(referral.earnedTon + quote.feeBreakdown.referralTon, 9);
  }

  token.feeVault.creatorTaxBuybackTon = roundNumber(
    token.feeVault.creatorTaxBuybackTon + quote.feeBreakdown.buybackTon,
    9
  );
  token.feeVault.creatorTaxBurnedTon = roundNumber(
    token.feeVault.creatorTaxBurnedTon + quote.feeBreakdown.burnTon,
    9
  );

  if (wallet === token.creatorWallet) {
    token.creatorPerformance.boughtTon = roundNumber(token.creatorPerformance.boughtTon + grossTon, 9);
  }

  appendTrade(token, {
    side: "BUY",
    wallet,
    tokenAmount: quote.tokenAmount,
    tonAmountGross: grossTon,
    tonAmountNet: quote.feeBreakdown.netTon,
    spotPriceTon: quote.newState.currentPriceTon,
    slippageBps: 500,
    feeBreakdown: quote.feeBreakdown,
    referralCode: referral?.code,
    referralWallet: referral?.wallet
  });
};

const applySellFixture = (token: TokenRecord, tokenAmount: number, wallet: string, referral?: ReferralEntry) => {
  const quote = quoteSell(token.state, tokenAmount, token.creatorTax, referral?.wallet);
  token.state = quote.newState;
  token.holderBalances[wallet] = roundNumber((token.holderBalances[wallet] ?? 0) - tokenAmount, 6);
  token.feeVault.treasuryTon = roundNumber(token.feeVault.treasuryTon + quote.feeBreakdown.platformTon, 9);
  token.feeVault.creatorClaimables[token.creatorWallet] = roundNumber(
    (token.feeVault.creatorClaimables[token.creatorWallet] ?? 0) + quote.feeBreakdown.creatorTon,
    9
  );

  if (referral) {
    token.feeVault.referralClaimables[referral.wallet] = roundNumber(
      (token.feeVault.referralClaimables[referral.wallet] ?? 0) + quote.feeBreakdown.referralTon,
      9
    );
    referral.totalVolumeTon = roundNumber(referral.totalVolumeTon + quote.tonAmountGross, 9);
    referral.earnedTon = roundNumber(referral.earnedTon + quote.feeBreakdown.referralTon, 9);
  }

  if (wallet === token.creatorWallet) {
    token.creatorPerformance.soldTon = roundNumber(token.creatorPerformance.soldTon + quote.tonAmountGross, 9);
  }

  appendTrade(token, {
    side: "SELL",
    wallet,
    tokenAmount,
    tonAmountGross: quote.tonAmountGross,
    tonAmountNet: quote.tonAmountNet,
    spotPriceTon: quote.newState.currentPriceTon,
    slippageBps: 500,
    feeBreakdown: quote.feeBreakdown,
    referralCode: referral?.code,
    referralWallet: referral?.wallet
  });
};

const graduateFixture = (token: TokenRecord) => {
  const preview = graduationPreview(token.state);
  token.status = "GRADUATED";
  token.refundStatus = "CLAIMABLE";
  token.platformVesting.graduatedAt = token.updatedAt;
  token.migration = {
    ...token.migration,
    adapterStatus: "MIGRATED",
    lpState: "LOCKED",
    migratedAt: token.updatedAt,
    creatorRefundTon: preview.creatorRefundTon,
    liquidityTon: preview.reserveAfterTon
  };
};

const buyToGraduation = (token: TokenRecord, wallet: string, referral?: ReferralEntry) => {
  while (!token.state.canGraduate) {
    const remainingTokens = token.state.remainingBondingSupply;
    const tokenChunk = Math.min(remainingTokens, 24_000_000);
    const grossTon = grossTonForBuyingTokens(token.state, tokenChunk, token.creatorTax);
    applyBuyFixture(token, grossTon, wallet, referral);
  }
};

export const createDemoSnapshot = (): LaunchpadSnapshot => {
  const emptyReferralWallet = makeWallet("REFERRAL");

  const referrals: ReferralEntry[] = [
    {
      code: generateReferralCode(emptyReferralWallet),
      wallet: emptyReferralWallet,
      totalVolumeTon: 0,
      earnedTon: 0,
      createdAt: new Date().toISOString()
    }
  ];

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    referrals,
    tokens: []
  };
};
