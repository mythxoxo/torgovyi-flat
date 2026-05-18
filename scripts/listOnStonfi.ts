import { getIndexedToken, upsertListingRow } from "../src/lib/server/indexer-store";
import { assertListingPreconditions, buildListingParams, previewStonfiListing } from "../src/lib/stonfi";

async function main() {
  const poolAddress = process.argv[2];
  const tonAmount = process.argv[3];
  const jettonAmount = process.argv[4];
  const execute = process.argv.includes("--execute");

  if (!poolAddress || !tonAmount || !jettonAmount) {
    throw new Error("Usage: npm run list:stonfi -- <poolAddress> <tonAmount> <jettonAmount> [--execute]");
  }

  const token = await getIndexedToken(poolAddress);
  if (!token) throw new Error("Pool not found in DB cache");

  assertListingPreconditions({
    isGraduated: token.status === "GRADUATED_READY" || token.status === "LISTED",
    isListed: token.is_listed,
    collectedTon: Number(token.collected_ton),
    targetTon: Number(token.target_ton),
    jettonMaster: token.jetton_address,
    lpLockAddress: token.lp_lock_address || undefined
  });

  if (!process.env.STONFI_ROUTER_ADDRESS) throw new Error("STONFI_ROUTER_ADDRESS missing");
  if (!process.env.STONFI_PTON_ADDRESS) throw new Error("STONFI_PTON_ADDRESS missing");
  if (Number(tonAmount) <= 0 || Number(jettonAmount) <= 0) throw new Error("Liquidity amounts must be > 0");
  if (!token.lp_lock_address) throw new Error("LP receiver must be LPLock, not creator wallet");
  if (token.lp_lock_address === token.creator) throw new Error("LP receiver cannot be creator wallet");
  if (execute && !process.env.LISTING_WALLET_MNEMONIC) throw new Error("LISTING_WALLET_MNEMONIC missing for --execute");

  const params = buildListingParams(
    {
      poolAddress: token.pool_address,
      jettonMaster: token.jetton_address,
      lpLockAddress: token.lp_lock_address || undefined,
      stonfiPoolAddress: token.stonfi_pool_address || undefined
    },
    { tonAmount, jettonAmount },
    {
      routerAddress: process.env.STONFI_ROUTER_ADDRESS,
      pTonAddress: process.env.STONFI_PTON_ADDRESS
    }
  );

  const preview = await previewStonfiListing(params);
  const summary = {
    mode: execute ? "execute" : "dry-run",
    poolAddress: token.pool_address,
    jettonAddress: token.jetton_address,
    collectedTon: token.collected_ton,
    targetTon: token.target_ton,
    lpLockAddress: token.lp_lock_address,
    request: preview.request,
    warnings: preview.warnings
  };

  console.log(JSON.stringify(summary, null, 2));

  if (execute) {
    await upsertListingRow({
      pool_address: token.pool_address,
      jetton_address: token.jetton_address,
      ton_amount: tonAmount,
      jetton_amount: jettonAmount,
      lp_lock_address: token.lp_lock_address || "",
      stonfi_tx_hash: `PENDING:${Date.now()}`,
      status: "PENDING",
      error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
