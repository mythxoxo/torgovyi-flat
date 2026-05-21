import { existsSync, readFileSync } from "node:fs";
import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

function loadLocalEnv(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv(".env.local");
loadLocalEnv(".env.production");

const endpoint = process.env.TONCENTER_API_KEY ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}` : "https://toncenter.com/api/v2/jsonRPC";
function arg(name: string) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : undefined; }

async function main() {
  const address = arg("--address");
  if (!address) throw new Error("Usage: npm run verify:factory -- --address <factory>");
  const client = new TonClient({ endpoint });
  const parsed = Address.parse(address);
  const state = await client.getContractState(parsed);

  if (state.state !== "active") {
    console.log(JSON.stringify({
      address,
      deployed: false,
      readyForManualDeploy: true,
      network: process.env.TON_NETWORK || process.env.NEXT_PUBLIC_TON_NETWORK || "mainnet"
    }, null, 2));
    return;
  }

  const factory = client.open(LaunchpadFactory.fromAddress(parsed));
  const [owner, poolCount] = await Promise.all([factory.getGetOwner(), factory.getGetPoolCount()]);
  console.log(JSON.stringify({
    address,
    deployed: true,
    network: process.env.TON_NETWORK || process.env.NEXT_PUBLIC_TON_NETWORK || "mainnet",
    owner: owner.toString({ bounceable: true, testOnly: false }),
    poolCount: poolCount.toString(),
    codeHash: state.code ? Buffer.from(state.code).toString("hex") : null,
    dataHash: state.data ? Buffer.from(state.data).toString("hex") : null
  }, null, 2));
}
main().catch((error)=>{console.error(error);process.exit(1);});
