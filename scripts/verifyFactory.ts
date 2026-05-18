import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

const endpoint = process.env.TONCENTER_API_KEY ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}` : "https://toncenter.com/api/v2/jsonRPC";
function arg(name: string) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : undefined; }

async function main() {
  const address = arg("--address");
  if (!address) throw new Error("Usage: npm run verify:factory -- --address <factory>");
  const client = new TonClient({ endpoint });
  const factory = client.open(LaunchpadFactory.fromAddress(Address.parse(address)));
  const [owner, poolCount] = await Promise.all([factory.getGetOwner(), factory.getGetPoolCount()]);
  console.log(JSON.stringify({ address, owner: owner.toString({ bounceable: true, testOnly: false }), poolCount: poolCount.toString() }, null, 2));
}
main().catch((error)=>{console.error(error);process.exit(1);});
