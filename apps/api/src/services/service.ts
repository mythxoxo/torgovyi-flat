import {
  CREATION_FEE_TON,
  DEFAULT_STONFI_ROUTER,
  LIQUIDITY_SUPPLY,
  createInitialBondingState,
  createPlatformVesting,
  createTokenImageDataUri,
  generateReferralCode,
  graduationPreview,
  normalizeCreatorTax,
  quoteBuy,
  quoteSell,
  refreshTokenDerivedFields,
  roundNumber,
  slugifyTokenId
} from "@meme-launchpad/shared";
import type {
  BuyRequest,
  CreateTokenInput,
  LaunchpadSnapshot,
  ReferralEntry,
  SellRequest,
  TokenComment,
  TokenRecord,
  TradeRecord,
  UserSummary
} from "@meme-launchpad/shared";

import type { SnapshotRepository } from "./repository.js";
import type { MediaStorage } from "./media.js";

type TokenFilter = "trending" | "new" | "almost-graduated" | "graduated" | "top-volume";

const palette = [
  ["#22d3ee", "#0f172a"],
  ["#fb7185", "#7c3aed"],
  ["#f59e0b", "#7c2d12"],
  ["#10b981", "#0f766e"],
  ["#60a5fa", "#1d4ed8"],
  ["#f97316", "#831843"]
] as const;

const scoreTrending = (token: TokenRecord): number => {
  const createdAt = new Date(token.createdAt).getTime();
  const ageHours = Math.max(1, (Date.now() - createdAt) / 3_600_000);
  const recencyBoost = 36 / ageHours;
  return token.state.volumeTon * 0.55 + token.state.progress * 35 + recencyBoost;
};

const buildContractAddresses = (id: string) => ({
  factory: `factory_${id}`,
  jettonMaster: `jetton_${id}`,
  bondingCurve: `bonding_${id}`,
  feeVault: `fees_${id}`,
  platformVestingVault: `vesting_${id}`,
  liquidityMigrator: `migrator_${id}`
});

const defaultComments = (token: TokenRecord): TokenComment[] =>
  token.comments.length > 0
    ? token.comments
    : [
        {
          id: `${token.id}-comment-placeholder`,
          author: "system",
          body: "Comments are a placeholder in MVP v1. Social feed and moderation come next.",
          createdAt: token.updatedAt
        }
      ];

const ensureReferral = (snapshot: LaunchpadSnapshot, wallet: string): ReferralEntry => {
  let entry = snapshot.referrals.find((item) => item.wallet === wallet);
  if (!entry) {
    entry = {
      code: generateReferralCode(wallet),
      wallet,
      totalVolumeTon: 0,
      earnedTon: 0,
      createdAt: new Date().toISOString()
    };
    snapshot.referrals.push(entry);
  }

  return entry;
};

const buildToken = (input: CreateTokenInput): TokenRecord => {
  const id = slugifyTokenId(input.ticker, input.name);
  const [primary, accent] = palette[id.length % palette.length] ?? palette[0];

  return refreshTokenDerivedFields({
    id,
    name: input.name.trim(),
    ticker: input.ticker.trim().toUpperCase(),
    image: input.image || createTokenImageDataUri(input.ticker, primary, accent),
    description: input.description?.trim() || `${input.name.trim()} launched from the TON meme launchpad MVP.`,
    creatorWallet: input.creatorWallet,
    creatorTelegramId: input.creatorTelegramId,
    links: {
      telegram: input.telegramLink,
      twitter: input.twitterLink,
      website: input.websiteLink
    },
    status: "BONDING",
    metadataStatus: "READY",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creationFeeEscrowTon: CREATION_FEE_TON,
    refundStatus: "LOCKED",
    creatorTax: normalizeCreatorTax(input.creatorTax),
    state: createInitialBondingState(),
    trades: [],
    comments: [],
    holderBalances: {},
    holderCount: 0,
    topHolders: [],
    creatorPerformance: {
      boughtTon: 0,
      soldTon: 0
    },
    feeVault: {
      treasuryTon: 0,
      creatorClaimables: {},
      referralClaimables: {},
      creatorClaimedTon: {},
      referralClaimedTon: {},
      creatorTaxBuybackTon: 0,
      creatorTaxBurnedTon: 0
    },
    platformVesting: createPlatformVesting(),
    migration: {
      adapterStatus: "MOCK_READY",
      routerAddress: DEFAULT_STONFI_ROUTER,
      lpState: "NONE",
      graduationFeeTon: 30,
      creatorRefundTon: 0,
      liquidityTon: 0,
      liquidityTokens: LIQUIDITY_SUPPLY
    },
    contractAddresses: buildContractAddresses(id)
  });
};

const sortTokens = (tokens: TokenRecord[], filter: TokenFilter): TokenRecord[] => {
  const items = [...tokens];
  switch (filter) {
    case "new":
      return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "almost-graduated":
      return items
        .filter((token) => token.status === "BONDING")
        .sort((a, b) => b.state.progress - a.state.progress);
    case "graduated":
      return items
        .filter((token) => token.status === "GRADUATED")
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    case "top-volume":
      return items.sort((a, b) => b.state.volumeTon - a.state.volumeTon);
    case "trending":
    default:
      return items.sort((a, b) => scoreTrending(b) - scoreTrending(a));
  }
};

const applyGraduation = (token: TokenRecord): TokenRecord => {
  const preview = graduationPreview(token.state);
  token.status = "GRADUATED";
  token.refundStatus = "CLAIMABLE";
  token.platformVesting.graduatedAt = new Date().toISOString();
  token.migration = {
    ...token.migration,
    adapterStatus: "MOCK_READY",
    lpState: "NONE",
    creatorRefundTon: preview.creatorRefundTon,
    liquidityTon: preview.reserveAfterTon,
    liquidityTokens: preview.liquidityTokens,
    lastError:
      "Mock STON.fi adapter active. Graduation reserve and liquidity balances are prepared, but router calls and LP lock are not executed on-chain yet."
  };
  token.updatedAt = new Date().toISOString();
  return token;
};

const resolveReferralWallet = (
  snapshot: LaunchpadSnapshot,
  code: string | undefined,
  actorWallet: string
): ReferralEntry | undefined => {
  if (!code) {
    return undefined;
  }

  const entry = snapshot.referrals.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!entry || entry.wallet === actorWallet) {
    return undefined;
  }

  return entry;
};

const appendTrade = (token: TokenRecord, trade: Omit<TradeRecord, "id" | "createdAt">): TokenRecord => {
  const nextTrade: TradeRecord = {
    ...trade,
    id: `${token.id}-${trade.side.toLowerCase()}-${token.trades.length + 1}`,
    createdAt: new Date().toISOString()
  };
  token.trades.unshift(nextTrade);
  token.updatedAt = nextTrade.createdAt;
  return token;
};

export class LaunchpadService {
  public constructor(
    private readonly repository: SnapshotRepository,
    private readonly webAppUrl: string,
    private readonly mediaStorage: MediaStorage = {
      normalizeTokenImage: async (image) => image,
      storeUploadedImage: async () => {
        throw new Error("Media storage is not configured for direct uploads");
      }
    }
  ) {}

  public async listTokens(filter: TokenFilter = "trending"): Promise<TokenRecord[]> {
    const snapshot = await this.repository.read();
    return sortTokens(snapshot.tokens.map((token) => refreshTokenDerivedFields(token)), filter);
  }

  public async getToken(id: string): Promise<TokenRecord> {
    const snapshot = await this.repository.read();
    const token = snapshot.tokens.find((item) => item.id === id);
    if (!token) {
      throw new Error("Token not found");
    }

    return refreshTokenDerivedFields({
      ...token,
      comments: defaultComments(token)
    });
  }

  public async createToken(input: CreateTokenInput): Promise<TokenRecord> {
    const snapshot = await this.repository.read();
    if (!input.name?.trim() || !input.ticker?.trim() || !input.creatorWallet?.trim()) {
      throw new Error("Missing required token creation fields");
    }

    if (input.image && input.image.length > 2_500_000) {
      throw new Error("Image payload too large");
    }

    const ticker = input.ticker.trim().toUpperCase();
    if (snapshot.tokens.some((token) => token.ticker === ticker || token.id === slugifyTokenId(ticker, input.name))) {
      throw new Error("Duplicate ticker or token id");
    }

    const token = buildToken({
      ...input,
      image: await this.mediaStorage.normalizeTokenImage(input.image),
      ticker
    });
    snapshot.tokens.unshift(token);
    ensureReferral(snapshot, input.creatorWallet);
    snapshot.updatedAt = new Date().toISOString();
    await this.repository.write(snapshot);
    return token;
  }

  public async getTrades(id: string): Promise<TradeRecord[]> {
    const token = await this.getToken(id);
    return token.trades.slice(0, 50);
  }

  public async getComments(id: string): Promise<TokenComment[]> {
    const token = await this.getToken(id);
    return defaultComments(token);
  }

  public async resolveReferral(code: string | undefined, wallet: string) {
    const snapshot = await this.repository.read();
    const entry = resolveReferralWallet(snapshot, code, wallet);
    return {
      code: code ?? null,
      valid: Boolean(entry),
      wallet: entry?.wallet ?? null,
      fallbackToTreasury: !entry
    };
  }

  public async buyToken(request: BuyRequest): Promise<TokenRecord> {
    const snapshot = await this.repository.read();
    const token = snapshot.tokens.find((item) => item.id === request.tokenId);
    if (!token) {
      throw new Error("Token not found");
    }
    if (token.status !== "BONDING") {
      throw new Error("Bonding curve trading is closed for this token");
    }

    const referral = resolveReferralWallet(snapshot, request.referralCode, request.wallet);
    const quote = quoteBuy(token.state, request.tonAmount, token.creatorTax, referral?.wallet);
    token.state = quote.newState;
    token.holderBalances[request.wallet] = roundNumber(
      (token.holderBalances[request.wallet] ?? 0) + quote.tokenAmount,
      6
    );
    token.feeVault.treasuryTon = roundNumber(token.feeVault.treasuryTon + quote.feeBreakdown.platformTon, 9);
    token.feeVault.creatorClaimables[token.creatorWallet] = roundNumber(
      (token.feeVault.creatorClaimables[token.creatorWallet] ?? 0) + quote.feeBreakdown.creatorTon,
      9
    );
    token.feeVault.creatorTaxBuybackTon = roundNumber(
      token.feeVault.creatorTaxBuybackTon + quote.feeBreakdown.buybackTon,
      9
    );
    token.feeVault.creatorTaxBurnedTon = roundNumber(
      token.feeVault.creatorTaxBurnedTon + quote.feeBreakdown.burnTon,
      9
    );

    if (referral) {
      referral.totalVolumeTon = roundNumber(referral.totalVolumeTon + request.tonAmount, 9);
      referral.earnedTon = roundNumber(referral.earnedTon + quote.feeBreakdown.referralTon, 9);
      token.feeVault.referralClaimables[referral.wallet] = roundNumber(
        (token.feeVault.referralClaimables[referral.wallet] ?? 0) + quote.feeBreakdown.referralTon,
        9
      );
    }

    if (request.wallet === token.creatorWallet) {
      token.creatorPerformance.boughtTon = roundNumber(token.creatorPerformance.boughtTon + request.tonAmount, 9);
    }

    appendTrade(token, {
      side: "BUY",
      wallet: request.wallet,
      tokenAmount: quote.tokenAmount,
      tonAmountGross: request.tonAmount,
      tonAmountNet: quote.feeBreakdown.netTon,
      spotPriceTon: quote.newState.currentPriceTon,
      slippageBps: request.slippageBps ?? 500,
      feeBreakdown: quote.feeBreakdown,
      referralCode: referral?.code,
      referralWallet: referral?.wallet
    });

    if (token.state.canGraduate) {
      applyGraduation(token);
    }

    snapshot.updatedAt = new Date().toISOString();
    await this.repository.write(snapshot);
    return refreshTokenDerivedFields(token);
  }

  public async sellToken(request: SellRequest): Promise<TokenRecord> {
    const snapshot = await this.repository.read();
    const token = snapshot.tokens.find((item) => item.id === request.tokenId);
    if (!token) {
      throw new Error("Token not found");
    }
    if (token.status !== "BONDING") {
      throw new Error("Bonding curve trading is closed for this token");
    }

    const balance = token.holderBalances[request.wallet] ?? 0;
    if (request.tokenAmount > balance) {
      throw new Error("Sell amount exceeds balance");
    }

    const referral = resolveReferralWallet(snapshot, request.referralCode, request.wallet);
    const quote = quoteSell(token.state, request.tokenAmount, token.creatorTax, referral?.wallet);
    token.state = quote.newState;
    token.holderBalances[request.wallet] = roundNumber(balance - request.tokenAmount, 6);
    token.feeVault.treasuryTon = roundNumber(token.feeVault.treasuryTon + quote.feeBreakdown.platformTon, 9);
    token.feeVault.creatorClaimables[token.creatorWallet] = roundNumber(
      (token.feeVault.creatorClaimables[token.creatorWallet] ?? 0) + quote.feeBreakdown.creatorTon,
      9
    );

    if (referral) {
      referral.totalVolumeTon = roundNumber(referral.totalVolumeTon + quote.tonAmountGross, 9);
      referral.earnedTon = roundNumber(referral.earnedTon + quote.feeBreakdown.referralTon, 9);
      token.feeVault.referralClaimables[referral.wallet] = roundNumber(
        (token.feeVault.referralClaimables[referral.wallet] ?? 0) + quote.feeBreakdown.referralTon,
        9
      );
    }

    if (request.wallet === token.creatorWallet) {
      token.creatorPerformance.soldTon = roundNumber(token.creatorPerformance.soldTon + quote.tonAmountGross, 9);
    }

    appendTrade(token, {
      side: "SELL",
      wallet: request.wallet,
      tokenAmount: request.tokenAmount,
      tonAmountGross: quote.tonAmountGross,
      tonAmountNet: quote.tonAmountNet,
      spotPriceTon: quote.newState.currentPriceTon,
      slippageBps: request.slippageBps ?? 500,
      feeBreakdown: quote.feeBreakdown,
      referralCode: referral?.code,
      referralWallet: referral?.wallet
    });

    snapshot.updatedAt = new Date().toISOString();
    await this.repository.write(snapshot);
    return refreshTokenDerivedFields(token);
  }

  public async getUser(wallet: string): Promise<UserSummary> {
    const snapshot = await this.repository.read();
    const referral = ensureReferral(snapshot, wallet);
    await this.repository.write(snapshot);
    const createdTokens = snapshot.tokens.filter((token) => token.creatorWallet === wallet);
    const creatorClaimableTon = roundNumber(
      createdTokens.reduce((sum, token) => sum + (token.feeVault.creatorClaimables[wallet] ?? 0), 0),
      9
    );
    const creatorClaimedTon = roundNumber(
      createdTokens.reduce((sum, token) => sum + (token.feeVault.creatorClaimedTon[wallet] ?? 0), 0),
      9
    );
    const creatorFeeEarnedTon = roundNumber(creatorClaimableTon + creatorClaimedTon, 9);
    const referralClaimableTon = roundNumber(
      snapshot.tokens.reduce((sum, token) => sum + (token.feeVault.referralClaimables[wallet] ?? 0), 0),
      9
    );
    const referralClaimedTon = roundNumber(
      snapshot.tokens.reduce((sum, token) => sum + (token.feeVault.referralClaimedTon[wallet] ?? 0), 0),
      9
    );

    return {
      wallet,
      createdTokens: createdTokens.map((token) => refreshTokenDerivedFields(token)),
      creatorFeeEarnedTon,
      creatorClaimableTon,
      creatorClaimedTon,
      referralCode: referral.code,
      referredVolumeTon: referral.totalVolumeTon,
      referralEarnedTon: referral.earnedTon,
      referralClaimableTon,
      referralClaimedTon,
      refunds: createdTokens.map((token) => ({
        tokenId: token.id,
        status: token.refundStatus,
        claimableTon: token.refundStatus === "CLAIMABLE" ? 1 : 0
      }))
    };
  }

  public async claimCreator(wallet: string) {
    const snapshot = await this.repository.read();
    let claimedTon = 0;

    for (const token of snapshot.tokens) {
      if (token.creatorWallet !== wallet) {
        continue;
      }

      const claimable = token.feeVault.creatorClaimables[wallet] ?? 0;
      if (claimable <= 0) {
        continue;
      }

      token.feeVault.creatorClaimables[wallet] = 0;
      token.feeVault.creatorClaimedTon[wallet] = roundNumber(
        (token.feeVault.creatorClaimedTon[wallet] ?? 0) + claimable,
        12
      );
      claimedTon += claimable;
      token.updatedAt = new Date().toISOString();
    }

    snapshot.updatedAt = new Date().toISOString();
    await this.repository.write(snapshot);

    return {
      wallet,
      type: "creator" as const,
      claimedTon: roundNumber(claimedTon, 9),
      user: await this.getUser(wallet)
    };
  }

  public async claimReferral(wallet: string) {
    const snapshot = await this.repository.read();
    let claimedTon = 0;

    for (const token of snapshot.tokens) {
      const claimable = token.feeVault.referralClaimables[wallet] ?? 0;
      if (claimable <= 0) {
        continue;
      }

      token.feeVault.referralClaimables[wallet] = 0;
      token.feeVault.referralClaimedTon[wallet] = roundNumber(
        (token.feeVault.referralClaimedTon[wallet] ?? 0) + claimable,
        12
      );
      claimedTon += claimable;
      token.updatedAt = new Date().toISOString();
    }

    snapshot.updatedAt = new Date().toISOString();
    await this.repository.write(snapshot);

    return {
      wallet,
      type: "referral" as const,
      claimedTon: roundNumber(claimedTon, 9),
      user: await this.getUser(wallet)
    };
  }

  public async claimRefund(wallet: string, tokenId: string) {
    const snapshot = await this.repository.read();
    const token = snapshot.tokens.find((item) => item.id === tokenId);
    if (!token) {
      throw new Error("Token not found");
    }
    if (token.creatorWallet !== wallet) {
      throw new Error("Only the creator can claim this refund");
    }
    if (token.refundStatus !== "CLAIMABLE") {
      throw new Error("Refund is not claimable");
    }

    token.refundStatus = "REFUNDED";
    token.creationFeeEscrowTon = 0;
    token.updatedAt = new Date().toISOString();
    snapshot.updatedAt = token.updatedAt;
    await this.repository.write(snapshot);

    return {
      wallet,
      type: "refund" as const,
      tokenId,
      claimedTon: 1,
      user: await this.getUser(wallet)
    };
  }

  public buildShareUrl(token: TokenRecord): string {
    return `${this.webAppUrl.replace(/\/$/, "")}/token/${token.id}`;
  }
}
