import { existsSync, readFileSync } from "node:fs";
import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { JettonMinter } from "../build/jetton-minter/JettonMinter_JettonMinter";


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

const endpoint = process.env.TONCENTER_API_KEY ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}` : "https://toncenter.com/api/v2/jsonRPC";
function arg(name: string) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : undefined; }

async function main() {
  const factoryArg = arg("--factory");
  const poolArg = arg("--pool");
  const jettonArg = arg("--jetton");
  if (!factoryArg || !poolArg || !jettonArg) throw new Error("Usage: npm run verify:token-flow -- --factory <factory> --pool <pool> --jetton <jetton>");
  const client = new TonClient({ endpoint });
  const factory = client.open(LaunchpadFactory.fromAddress(Address.parse(factoryArg)));
  const pool = client.open(LaunchpadPool.fromAddress(Address.parse(poolArg)));
  const jetton = client.open(JettonMinter.fromAddress(Address.parse(jettonArg)));
  const [poolCount, creator, jettonMaster, collected, sold, target, jettonData] = await Promise.all([
    factory.getGetPoolCount(),
    pool.getGetCreator(),
    pool.getGetJettonMaster(),
    pool.getGetCollectedTon(),
    pool.getGetSoldTokens(),
    pool.getGetTargetTon(),
    jetton.getGetJettonData()
  ]);
  console.log(JSON.stringify({
    factory: factoryArg,
    pool: poolArg,
    jetton: jettonArg,
    poolCount: poolCount.toString(),
    poolCreator: creator.toString({ bounceable: true, testOnly: false }),
    poolJettonMaster: jettonMaster.toString({ bounceable: true, testOnly: false }),
    collectedTon: collected.toString(),
    soldTokens: sold.toString(),
    targetTon: target.toString(),
    jettonAdmin: jettonData.adminAddress.toString({ bounceable: true, testOnly: false })
  }, null, 2));
}
main().catch((error)=>{console.error(error);process.exit(1);});
