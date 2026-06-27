import { buildStonfiSwapPayload } from "../src/lib/dex/stonfi/swap";

async function main() {
  const result = await buildStonfiSwapPayload({
    tokenAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    side: "sell",
    amount: "1000000000",
    platform: "stonfi",
    userWallet: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    platforms: ["stonfi"],
    slippageBps: 300
  });

  if (!result.status) throw new Error("missing status");
  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
