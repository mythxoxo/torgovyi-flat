import type { HolderSnapshot, TokenRecord } from "./types";

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const roundNumber = (value: number, digits = 6): number =>
  Number(value.toFixed(digits));

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const slugifyTokenId = (ticker: string, name: string): string =>
  `${ticker}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const safeDivide = (value: number, divisor: number): number =>
  divisor === 0 ? 0 : value / divisor;

export const makeWallet = (seed: string): string => `EQ${seed.padEnd(46, "A").slice(0, 46)}`;

export const generateReferralCode = (wallet: string): string => wallet.slice(2, 10).toUpperCase();

export const topHoldersFromBalances = (balances: Record<string, number>): HolderSnapshot[] => {
  const total = Object.values(balances).reduce((sum, amount) => sum + amount, 0);
  return Object.entries(balances)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([wallet, amount]) => ({
      wallet,
      amount: roundNumber(amount, 2),
      percentage: roundNumber(safeDivide(amount, total), 4)
    }));
};

export const createTokenImageDataUri = (ticker: string, primary: string, accent: string): string => {
  const initial = ticker.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${accent}"/></linearGradient></defs><rect width="240" height="240" rx="72" fill="url(#g)"/><circle cx="180" cy="70" r="28" fill="rgba(255,255,255,0.18)"/><text x="120" y="136" text-anchor="middle" fill="#f8fafc" font-family="Verdana, sans-serif" font-size="64" font-weight="700">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const refreshTokenDerivedFields = (token: TokenRecord): TokenRecord => ({
  ...token,
  holderCount: Object.values(token.holderBalances).filter((amount) => amount > 0).length,
  topHolders: topHoldersFromBalances(token.holderBalances)
});
