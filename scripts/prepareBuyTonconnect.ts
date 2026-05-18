import { Address } from "@ton/core";
import { buildBuyDraft } from "../src/lib/onchain";

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function parseRequiredAddress(value: string | undefined, label: string) {
  if (!value || !value.trim()) throw new Error(`${label} is required`);
  try {
    return Address.parse(value.trim()).toString({ bounceable: true, testOnly: false });
  } catch {
    throw new Error(`${label} is invalid`);
  }
}

async function main() {
  const pool = parseRequiredAddress(arg("--pool") || process.env.PREPARE_BUY_POOL_ADDRESS, "pool");
  const amount = Number(arg("--amount") || process.env.LIVE_BUY_AMOUNT_TON || "0.05");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("amount is invalid");

  const draft = buildBuyDraft({
    poolAddress: pool,
    tonAmount: amount,
    minTokensOut: 1n
  });

  console.log(JSON.stringify({
    ok: true,
    kind: "buy-tonconnect-prep",
    pool,
    amountTon: amount,
    draft
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
