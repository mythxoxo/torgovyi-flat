import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { JettonMinter } from "../build/jetton-minter/JettonMinter_JettonMinter";

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
