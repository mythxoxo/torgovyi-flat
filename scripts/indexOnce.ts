import { runIndexer } from "../indexer/index";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      mode: "dry-run",
      factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || null,
      note: "Set NEXT_PUBLIC_FACTORY_ADDRESS and DATABASE_URL before execute."
    }, null, 2));
    return;
  }

  if (!process.argv.includes("--execute")) {
    throw new Error("Pass --dry-run or --execute");
  }

  const result = await runIndexer();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
