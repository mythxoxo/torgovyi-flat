const DEFAULT_DEX_PLATFORM_FEE_BPS = 25;

export function getDexPlatformFeeBps() {
  const parsed = Number(process.env.DEX_PLATFORM_FEE_BPS || DEFAULT_DEX_PLATFORM_FEE_BPS);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 500) return DEFAULT_DEX_PLATFORM_FEE_BPS;
  return Math.floor(parsed);
}

export function getDexPlatformFeeTreasury() {
  return process.env.DEX_PLATFORM_FEE_TREASURY?.trim() || "";
}

export function calculatePlatformFeeUnits(amountUnits: string | number | bigint, bps = getDexPlatformFeeBps()) {
  const amount = BigInt(String(amountUnits || 0));
  if (amount <= 0n || bps <= 0) return "0";
  return ((amount * BigInt(bps)) / 10000n).toString();
}

export function subtractFeeUnits(amountUnits: string | number | bigint, feeUnits: string | number | bigint) {
  const amount = BigInt(String(amountUnits || 0));
  const fee = BigInt(String(feeUnits || 0));
  return amount > fee ? (amount - fee).toString() : "0";
}
