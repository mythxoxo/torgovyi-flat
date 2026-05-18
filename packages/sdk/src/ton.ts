import { address, beginCell } from "@ton/core";
import {
  normalizeCreatorTax,
  type CreatorTaxConfig,
  type TokenRecord
} from "@meme-launchpad/shared";

export interface TonTransactionDraft {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
  }>;
}

export interface CreateTokenDraftInput {
  factoryAddress: string;
  creatorAddress: string;
  name: string;
  ticker: string;
  metadataUri: string;
  creatorTax?: Partial<CreatorTaxConfig>;
}

export interface BuyDraftInput {
  contractAddress: string;
  tonAmountNanoTon: bigint;
  referralAddress?: string;
  minTokensOut?: bigint;
}

export interface SellDraftInput {
  contractAddress: string;
  gasAmountNanoTon: bigint;
  tokenAmount: bigint;
  referralAddress?: string;
  minTonOut?: bigint;
}

export const resolveApiBaseUrl = (explicit?: string): string =>
  explicit?.trim() || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const buildReferralLink = (baseUrl: string, code: string): string =>
  `${baseUrl.replace(/\/$/, "")}/?startapp=ref_${encodeURIComponent(code)}`;

export const isTonAddress = (value: string): boolean => {
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
};

export const toTestnetAddress = (value: string): string =>
  address(value).toString({ bounceable: true, testOnly: true });

const toBps = (value: number): bigint => BigInt(Math.round(value * 10_000));

const toPayload = (builder: ReturnType<typeof beginCell>): string =>
  builder.endCell().toBoc().toString("base64");

const nextQueryId = (): bigint => BigInt(Date.now());

const storeCreatorTax = (tax: CreatorTaxConfig) => (builder: ReturnType<typeof beginCell>) =>
  builder
    .storeUint(toBps(tax.rate), 16)
    .storeUint(toBps(tax.buybackSplit), 16)
    .storeUint(toBps(tax.burnSplit), 16);

export const buildCreateTokenDraft = ({
  factoryAddress,
  creatorAddress,
  name,
  ticker,
  metadataUri,
  creatorTax
}: CreateTokenDraftInput): TonTransactionDraft => {
  const normalizedTax = normalizeCreatorTax(creatorTax);
  const payload = toPayload(
    beginCell()
      .storeUint(0x1001, 32)
      .storeUint(nextQueryId(), 64)
      .storeStringRefTail(name)
      .storeStringRefTail(ticker)
      .storeStringRefTail(metadataUri)
      .storeAddress(address(creatorAddress))
      .store(storeCreatorTax(normalizedTax))
  );

  return {
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [
      {
        address: factoryAddress,
        amount: "1000000000",
        payload
      }
    ]
  };
};

export const buildBuyDraft = ({
  contractAddress,
  tonAmountNanoTon,
  referralAddress,
  minTokensOut = 0n
}: BuyDraftInput): TonTransactionDraft => ({
  validUntil: Math.floor(Date.now() / 1000) + 300,
  messages: [
    {
      address: contractAddress,
      amount: tonAmountNanoTon.toString(),
      payload: toPayload(
        beginCell()
          .storeUint(0x3001, 32)
          .storeUint(nextQueryId(), 64)
          .storeAddress(referralAddress ? address(referralAddress) : null)
          .storeUint(minTokensOut, 128)
      )
    }
  ]
});

export const buildSellDraft = ({
  contractAddress,
  gasAmountNanoTon,
  tokenAmount,
  referralAddress,
  minTonOut = 0n
}: SellDraftInput): TonTransactionDraft => ({
  validUntil: Math.floor(Date.now() / 1000) + 300,
  messages: [
    {
      address: contractAddress,
      amount: gasAmountNanoTon.toString(),
      payload: toPayload(
        beginCell()
          .storeUint(0x3002, 32)
          .storeUint(nextQueryId(), 64)
          .storeUint(tokenAmount, 128)
          .storeAddress(referralAddress ? address(referralAddress) : null)
          .storeCoins(minTonOut)
      )
    }
  ]
});

export const buildTradeDraft = (
  contractAddress: string,
  amount: bigint,
  operation: "buy" | "sell",
  referralAddress?: string
): TonTransactionDraft =>
  operation === "buy"
    ? buildBuyDraft({
        contractAddress,
        tonAmountNanoTon: amount,
        referralAddress
      })
    : buildSellDraft({
        contractAddress,
        gasAmountNanoTon: 50_000_000n,
        tokenAmount: amount,
        referralAddress
      });

export const describeCreatorTax = (tax: CreatorTaxConfig): string => {
  if (tax.rate === 0) {
    return "No creator tax";
  }

  const buyback = Math.round(tax.buybackSplit * 100);
  const burn = Math.round(tax.burnSplit * 100);
  return `${(tax.rate * 100).toFixed(1)}% creator tax (${buyback}% buyback, ${burn}% burn)`;
};

export const summarizeTokenShareCard = (token: TokenRecord): string =>
  `${token.name} ($${token.ticker}) - ${token.status} - ${(token.state.progress * 100).toFixed(1)}% bonded`;
