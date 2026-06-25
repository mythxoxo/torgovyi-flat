import { quoteDedust } from "../src/lib/dex/dedust/quote";

async function main() {
  const quote = await quoteDedust({
    tokenAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    side: "buy",
    amount: "1000000000",
    platforms: ["dedust"],
    slippageBps: 300
  });

  if (!quote.status) throw new Error("missing quote status");
  if (quote.status === "quote_ready" && quote.routeFound !== true) throw new Error("quote_ready requires routeFound true");
  console.log(JSON.stringify({ ok: true, quote }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
