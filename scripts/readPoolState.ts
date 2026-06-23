import { existsSync, readFileSync } from "node:fs";
import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";


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
loadLocalEnv('.env.local');
loadLocalEnv('.env.production');

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : "https://toncenter.com/api/v2/jsonRPC";

async function main() {
  const poolArg = process.argv[2];
  if (!poolArg) throw new Error("Usage: npm run read:pool -- <poolAddress>");

  const client = new TonClient({ endpoint });
  const pool = client.open(LaunchpadPool.fromAddress(Address.parse(poolArg)));

  const [state, collectedTon, targetTon, creator, jettonMaster, soldTokens, graduated, listed, lpLock] = await Promise.all([
    pool.getGetState(),
    pool.getGetCollectedTon(),
    pool.getGetTargetTon(),
    pool.getGetCreator(),
    pool.getGetJettonMaster(),
    pool.getGetSoldTokens(),
    pool.getGetIsGraduated(),
    pool.getGetIsListed(),
    pool.getGetLpLock()
  ]);

  console.log(JSON.stringify({
    state: state.toString(),
    collectedTon: collectedTon.toString(),
    targetTon: targetTon.toString(),
    creator: creator.toString({ bounceable: true, testOnly: false }),
    jettonMaster: jettonMaster.toString({ bounceable: true, testOnly: false }),
    soldTokens: soldTokens.toString(),
    graduated,
    listed,
    lpLock: lpLock.toString({ bounceable: true, testOnly: false })
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
