import { beginCell, Address, toNano } from "@ton/core";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { LPLock } from "../build/lp-lock/LPLock_LPLock";
import { JettonMinter } from "../build/jetton-minter/JettonMinter_JettonMinter";
import { DEFAULT_TEST_TARGET_TON, PRODUCTION_TARGET_TON } from "../src/lib/launch-config";

const FALLBACK_CREATOR = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const creator = Address.parse(process.env.EXAMPLE_CREATOR_ADDRESS || process.env.FACTORY_OWNER_ADDRESS || FALLBACK_CREATOR);
  const targetTon = Number(arg("--target") || process.env.LAUNCHPAD_TARGET_TON || DEFAULT_TEST_TARGET_TON);
  const lpLock = await LPLock.fromInit(creator, 0n, true);
  const minter = await JettonMinter.fromInit(0n, creator, beginCell().endCell(), creator, false);
  const pool = await LaunchpadPool.fromInit(creator, minter.address, lpLock.address, toNano(String(targetTon)));

  console.log(JSON.stringify({
    ok: true,
    kind: "token-flow-tonconnect-prep",
    creator: creator.toString({ bounceable: true, testOnly: false }),
    targetTon,
    productionTargetTon: PRODUCTION_TARGET_TON,
    testMode: targetTon !== PRODUCTION_TARGET_TON,
    jettonMaster: minter.address.toString({ bounceable: true, testOnly: false }),
    pool: pool.address.toString({ bounceable: true, testOnly: false }),
    lpLock: lpLock.address.toString({ bounceable: true, testOnly: false })
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
