import { buildDedustSwapPayload } from "../src/lib/dex/dedust/swap";

async function main() {
  const result = await buildDedustSwapPayload({
    tokenAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    side: "buy",
    amount: "1000000000",
    platform: "dedust",
    userWallet: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    platforms: ["dedust"],
    slippageBps: 300
  });

  if (!result.status) throw new Error("missing status");
  if (result.status === "payload_ready" && result.messages.length === 0) throw new Error("payload_ready requires messages");
  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
