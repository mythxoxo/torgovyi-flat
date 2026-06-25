import { quoteStonfi } from "../src/lib/dex/stonfi/quote";

async function main() {
  const quote = await quoteStonfi({
    tokenAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    side: "buy",
    amount: "1000000000",
    platforms: ["stonfi"],
    slippageBps: 300
  });

  if (!quote.status) throw new Error("missing quote status");
  console.log(JSON.stringify({ ok: true, quote }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
