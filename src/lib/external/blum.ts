import type { TokenRecord, TokenStatus } from "../shared";

export interface BlumFeedResult {
  source: "configured_feed" | "address_list" | "not_configured";
  configured: boolean;
  scannedAt: string;
  tokens: TokenRecord[];
  warning?: string;
}

interface FetchBlumMemepadTokensOptions {
  addresses?: string[];
  limit?: number;
}

type UnknownRecord = Record<string, unknown>;

const BLUM_BONDING_SUPPLY = 800_000_000;
const BLUM_LISTING_TARGET_TON = 1500;
const BLUM_LIQUIDITY_TON = 1450;
const BLUM_DEX_LISTING_FEE_TON = 50;
const DEFAULT_IMAGE = "/ton.svg";

const COMMON_ARRAY_KEYS = ["tokens", "items", "data", "result", "rows", "list", "projects"];

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

function asArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];

  for (const key of COMMON_ARRAY_KEYS) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested;
    const nestedRecord = asRecord(nested);
    if (nestedRecord) {
      const nestedArray = asArrayPayload(nestedRecord);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  return [];
}

function pickString(record: UnknownRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function pickNumber(record: UnknownRecord, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/,/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
}

function pickBoolean(record: UnknownRecord, keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (["true", "listed", "dex", "migrated"].includes(normalized)) return true;
      if (["false", "bonding", "new"].includes(normalized)) return false;
    }
  }
  return fallback;
}

function normalizeTonAddress(value: string): string {
  return value.trim();
}

function looksLikeTonAddress(value: string): boolean {
  const normalized = value.trim();
  return /^(EQ|UQ)[A-Za-z0-9_-]{40,80}$/.test(normalized) || /^-?\d+:[a-fA-F0-9]{64}$/.test(normalized);
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > 1) return Math.max(0, Math.min(value / 100, 1));
  return Math.max(0, Math.min(value, 1));
}

function buildTokenFromRecord(record: UnknownRecord, index: number): TokenRecord | null {
  const address = normalizeTonAddress(
    pickString(record, [
      "jettonAddress",
      "jetton_address",
      "jettonMaster",
      "jetton_master",
      "master",
      "contract",
      "contractAddress",
      "address",
      "pool_address"
    ])
  );

  if (!address || !looksLikeTonAddress(address)) return null;

  const now = new Date().toISOString();
  const name = pickString(record, ["name", "title", "tokenName", "token_name"], `Blum token ${index + 1}`);
  const tickerRaw = pickString(record, ["ticker", "symbol", "tokenSymbol", "token_symbol"], "BLUM");
  const ticker = tickerRaw.startsWith("$") ? tickerRaw : `$${tickerRaw}`;
  const createdAt = pickString(record, ["createdAt", "created_at", "launchedAt", "launched_at", "date"], now);
  const updatedAt = pickString(record, ["updatedAt", "updated_at", "lastTradeAt", "last_trade_at"], createdAt);
  const collectedTon = pickNumber(record, ["collectedTon", "collected_ton", "tonCollected", "ton_collected", "reserveTon", "reserve_ton"], 0);
  const targetTon = pickNumber(record, ["targetTon", "target_ton", "capTon", "cap_ton", "hardcapTon", "hardcap_ton"], BLUM_LISTING_TARGET_TON);
  const progress = clampProgress(pickNumber(record, ["progress", "bondingProgress", "bonding_progress"], targetTon > 0 ? collectedTon / targetTon : 0));
  const listed = pickBoolean(record, ["isListed", "is_listed", "listed", "dex", "migrated"], progress >= 1);
  const status: TokenStatus = listed ? "LISTED" : progress >= 1 ? "GRADUATED_READY" : "BONDING";
  const marketCapTon = pickNumber(record, ["marketCapTon", "market_cap_ton", "mcapTon", "mcap_ton"], collectedTon);
  const volumeTon = pickNumber(record, ["volumeTon", "volume_ton", "volume24hTon", "volume_24h_ton"], 0);
  const holderCount = Math.max(0, Math.floor(pickNumber(record, ["holders", "holderCount", "holder_count"], 0)));
  const image = pickString(record, ["image", "imageUrl", "image_url", "icon", "logo", "logoUrl", "logo_url"], DEFAULT_IMAGE);
  const telegram = pickString(record, ["telegram", "telegramLink", "telegram_link", "tg", "tgLink"], "");
  const twitter = pickString(record, ["twitter", "twitterLink", "twitter_link", "x", "xLink"], "");
  const website = pickString(record, ["website", "websiteLink", "website_link", "url"], `https://tonviewer.com/${address}`);

  return {
    id: `blum:${address}`,
    name,
    ticker,
    image,
    description: pickString(record, ["description", "desc", "about"], "Imported from Blum Memepad external feed."),
    creatorWallet: pickString(record, ["creator", "creatorWallet", "creator_wallet", "author", "owner"], "blum-memepad"),
    links: {
      telegram: telegram || undefined,
      twitter: twitter || undefined,
      website: website || undefined
    },
    status,
    metadataStatus: "READY",
    createdAt,
    updatedAt,
    creationFeeEscrowTon: 0.5,
    refundStatus: "LOCKED",
    creatorTax: {
      mode: "normal",
      rate: 0,
      buybackSplit: 0,
      burnSplit: 0
    },
    state: {
      soldSupply: pickNumber(record, ["soldSupply", "sold_supply", "soldTokens", "sold_tokens"], progress * BLUM_BONDING_SUPPLY),
      reserveTon: collectedTon,
      currentPriceTon: pickNumber(record, ["priceTon", "price_ton", "currentPriceTon", "current_price_ton"], 0),
      progress,
      marketCapTon,
      volumeTon,
      graduationTargetTon: targetTon,
      expectedPoolRatioTon: BLUM_LIQUIDITY_TON,
      remainingBondingSupply: Math.max(0, BLUM_BONDING_SUPPLY - progress * BLUM_BONDING_SUPPLY),
      circulatingSupply: progress * BLUM_BONDING_SUPPLY,
      antiSnipeEndsAt: createdAt,
      canGraduate: progress >= 1,
      collectedTon,
      targetTon,
      isGraduated: progress >= 1,
      isListed: listed
    },
    trades: [],
    comments: [],
    holderBalances: {},
    holderCount,
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
    platformVesting: {
      totalAllocation: 0,
      immediateUnlockAmount: 0,
      linearUnlockAmount: 0,
      claimedAmount: 0
    },
    migration: {
      adapterStatus: listed ? "LISTED" : progress >= 1 ? "READY" : "PENDING",
      routerAddress: "STON.fi V2",
      lpState: listed ? "LOCKED" : "NONE",
      graduationFeeTon: BLUM_DEX_LISTING_FEE_TON,
      creatorRefundTon: 0,
      liquidityTon: listed ? BLUM_LIQUIDITY_TON : 0,
      liquidityTokens: listed ? 200_000_000 : 0,
      listingTxHash: undefined
    },
    contractAddresses: {
      factory: "blum-memepad",
      jettonMaster: address,
      bondingCurve: address,
      feeVault: undefined,
      platformVestingVault: undefined,
      liquidityMigrator: "STON.fi V2",
      lpLock: undefined
    }
  };
}

function buildTokenFromAddress(address: string, index: number): TokenRecord | null {
  if (!looksLikeTonAddress(address)) return null;
  return buildTokenFromRecord(
    {
      address,
      name: `Blum Memepad ${index + 1}`,
      ticker: "BLUM",
      description: "Blum Memepad candidate loaded from BLUM_MEMEPAD_JETTONS/address list.",
      createdAt: new Date().toISOString(),
      website: `https://tonviewer.com/${address}`
    },
    index
  );
}

function uniqueTokens(tokens: TokenRecord[]): TokenRecord[] {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const key = token.contractAddresses.jettonMaster || token.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchConfiguredFeed(limit: number): Promise<TokenRecord[]> {
  const feedUrl = process.env.BLUM_MEMEPAD_FEED_URL;
  if (!feedUrl) return [];

  const response = await fetch(feedUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Blum feed returned ${response.status}`);
  }

  const payload = await response.json();
  return asArrayPayload(payload)
    .map((item, index) => {
      const record = asRecord(item);
      return record ? buildTokenFromRecord(record, index) : null;
    })
    .filter((token): token is TokenRecord => Boolean(token))
    .slice(0, limit);
}

export async function fetchBlumMemepadTokens(options: FetchBlumMemepadTokensOptions = {}): Promise<BlumFeedResult> {
  const limit = Math.max(1, Math.min(options.limit ?? 24, 100));
  const envAddresses = (process.env.BLUM_MEMEPAD_JETTONS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const addresses = [...(options.addresses ?? []), ...envAddresses];
  const scannedAt = new Date().toISOString();

  try {
    const feedTokens = await fetchConfiguredFeed(limit);
    if (feedTokens.length > 0) {
      return {
        source: "configured_feed",
        configured: true,
        scannedAt,
        tokens: uniqueTokens(feedTokens).slice(0, limit)
      };
    }
  } catch (error) {
    return {
      source: "configured_feed",
      configured: true,
      scannedAt,
      tokens: [],
      warning: error instanceof Error ? error.message : "Failed to fetch configured Blum feed"
    };
  }

  if (addresses.length > 0) {
    return {
      source: "address_list",
      configured: true,
      scannedAt,
      tokens: uniqueTokens(
        addresses
          .map((address, index) => buildTokenFromAddress(address, index))
          .filter((token): token is TokenRecord => Boolean(token))
      ).slice(0, limit)
    };
  }

  return {
    source: "not_configured",
    configured: false,
    scannedAt,
    tokens: [],
    warning:
      "Blum has a public Memepad UI, but I found no official public discovery SDK/API. Set BLUM_MEMEPAD_FEED_URL to a JSON feed or BLUM_MEMEPAD_JETTONS to comma-separated jetton masters."
  };
}
