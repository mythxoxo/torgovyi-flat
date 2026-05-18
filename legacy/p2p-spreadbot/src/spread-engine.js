import crypto from "node:crypto";

const venueProfiles = {
  binance_p2p: { label: "Binance P2P", bias: -0.009, volatility: 0.014 },
  bybit_p2p: { label: "Bybit P2P", bias: -0.004, volatility: 0.013 },
  bestchange: { label: "BestChange", bias: 0.011, volatility: 0.01 },
  spot: { label: "Spot Reference", bias: 0.002, volatility: 0.006 }
};

const marketReferences = [
  { asset: "USDT", fiat: "RUB", reference: 94.6 },
  { asset: "USDT", fiat: "UAH", reference: 40.1 },
  { asset: "USDT", fiat: "KZT", reference: 453.8 },
  { asset: "USDT", fiat: "EUR", reference: 0.924 },
  { asset: "USDC", fiat: "RUB", reference: 94.3 },
  { asset: "USDC", fiat: "UAH", reference: 39.95 },
  { asset: "BTC", fiat: "USDT", reference: 97200 }
];

function seededUnit(seed) {
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff;
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function bucketSeed() {
  return Math.floor(Date.now() / 30000);
}

export function generateSpreadSnapshot() {
  const seedBase = bucketSeed();
  const refreshedAt = new Date().toISOString();
  const rows = [];

  for (const market of marketReferences) {
    const venueRates = Object.entries(venueProfiles).map(([venueId, profile]) => {
      const jitter = seededUnit(`${seedBase}:${market.asset}:${market.fiat}:${venueId}`);
      const drift = (jitter - 0.5) * profile.volatility;
      const rate = market.reference * (1 + profile.bias + drift);

      return {
        venueId,
        venueLabel: profile.label,
        rate: round(rate, market.reference > 1000 ? 2 : 4),
        liquidity: Math.round(800 + jitter * 12000),
        minOrder: Math.round(50 + jitter * 800),
        maxOrder: Math.round(1500 + jitter * 25000)
      };
    });

    for (const buy of venueRates) {
      for (const sell of venueRates) {
        if (buy.venueId === sell.venueId) {
          continue;
        }

        const spreadPct = ((sell.rate - buy.rate) / buy.rate) * 100;
        if (spreadPct < 0.25) {
          continue;
        }

        const scoreSeed = seededUnit(
          `${seedBase}:score:${market.asset}:${market.fiat}:${buy.venueId}:${sell.venueId}`
        );

        rows.push({
          id: `${market.asset}_${market.fiat}_${buy.venueId}_${sell.venueId}`,
          asset: market.asset,
          fiat: market.fiat,
          buyVenueId: buy.venueId,
          buyVenueLabel: buy.venueLabel,
          sellVenueId: sell.venueId,
          sellVenueLabel: sell.venueLabel,
          buyRate: buy.rate,
          sellRate: sell.rate,
          spreadPct: round(spreadPct, 2),
          estimatedProfitPer1000: round((sell.rate - buy.rate) * 1000, 2),
          minOrder: Math.max(buy.minOrder, sell.minOrder),
          maxOrder: Math.min(buy.maxOrder, sell.maxOrder),
          liquidityScore: Math.round((buy.liquidity + sell.liquidity) / 2),
          confidence: round(0.72 + scoreSeed * 0.25, 2),
          updatedAt: refreshedAt
        });
      }
    }
  }

  rows.sort((left, right) => {
    if (right.spreadPct !== left.spreadPct) {
      return right.spreadPct - left.spreadPct;
    }

    return right.liquidityScore - left.liquidityScore;
  });

  return {
    refreshedAt,
    rows
  };
}
