import { buildDedustSwapPayload } from "../src/lib/dex/dedust/swap";

async function main() {
  const result = await buildDedustSwapPayload({
    tokenAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    side: "sell",
    amount: "1000000000",
    platform: "dedust",
    userWallet: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    platforms: ["dedust"],
    slippageBps: 300
  });

  if (result.status !== "proxy_required_for_sell_fee") throw new Error(`expected proxy_required_for_sell_fee, got ${result.status}`);
  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
