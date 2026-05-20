export function formatTonFromNano(value: string | number | bigint | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0";
  try {
    const raw = BigInt(value);
    const whole = raw / 1_000_000_000n;
    const fraction = raw % 1_000_000_000n;
    const fractionText = fraction.toString().padStart(9, "0").replace(/0+$/, "").slice(0, 4);
    return fractionText ? `${whole}.${fractionText}` : whole.toString();
  } catch {
    return "0";
  }
}

export function formatTokenAmount(
  value: string | number | bigint | null | undefined,
  decimals: number | string | null | undefined = 9,
  maxFraction = 4
): string {
  if (value === null || value === undefined || value === "") return "0";
  try {
    const raw = BigInt(value);
    const d = Number(decimals ?? 9);
    if (!Number.isFinite(d) || d < 0) return raw.toString();
    if (d === 0) return raw.toString();
    const base = 10n ** BigInt(d);
    const whole = raw / base;
    const fraction = raw % base;
    const fractionText = fraction.toString().padStart(d, "0").replace(/0+$/, "").slice(0, maxFraction);
    return fractionText ? `${whole}.${fractionText}` : whole.toString();
  } catch {
    return "0";
  }
}
