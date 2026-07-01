import { existsSync, readFileSync } from "node:fs";
import { beginCell, Address, toNano } from "@ton/core";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { LPLock } from "../build/lp-lock/LPLock_LPLock";
import { JettonMinter, storeConfigureLaunchPhase, storeChangeOwner } from "../build/jetton-minter/JettonMinter_JettonMinter";
import { storeRegisterPool } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { DEFAULT_TEST_TARGET_TON, PRODUCTION_TARGET_TON } from "../src/lib/launch-config";

const FALLBACK_CREATOR = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

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

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const creator = Address.parse(process.env.EXAMPLE_CREATOR_ADDRESS || process.env.TONS_OF_GRAM_DEPLOYER_ADDRESS || process.env.FACTORY_OWNER_ADDRESS || FALLBACK_CREATOR);
  const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  if (!factory) throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS is required");

  const targetTon = Number(arg("--target") || process.env.LAUNCHPAD_TARGET_TON || DEFAULT_TEST_TARGET_TON);
  const lpLock = await LPLock.fromInit(creator, 0n, true);
  const minter = await JettonMinter.fromInit(0n, creator, beginCell().endCell(), creator, false);
  const pool = await LaunchpadPool.fromInit(creator, minter.address, lpLock.address, toNano(String(targetTon)));

  const validUntil = Math.floor(Date.now() / 1000) + 600;

  const changeOwnerPayload = beginCell().store(storeChangeOwner({
    $$type: "ChangeOwner",
    queryId: 0n,
    newOwner: pool.address
  })).endCell().toBoc().toString("base64");

  const configureLaunchPayload = beginCell().store(storeConfigureLaunchPhase({
    $$type: "ConfigureLaunchPhase",
    queryId: 0n,
    pool: pool.address,
    transfersEnabled: false
  })).endCell().toBoc().toString("base64");

  const registerPoolPayload = beginCell().store(storeRegisterPool({
    $$type: "RegisterPool",
    pool: pool.address,
    jettonMaster: minter.address,
    creator
  })).endCell().toBoc().toString("base64");

  console.log(JSON.stringify({
    ok: true,
    kind: "token-flow-tonconnect-prep",
    creator: creator.toString({ bounceable: true, testOnly: false }),
    factory,
    targetTon,
    productionTargetTon: PRODUCTION_TARGET_TON,
    testMode: targetTon !== PRODUCTION_TARGET_TON,
    jettonMaster: minter.address.toString({ bounceable: true, testOnly: false }),
    pool: pool.address.toString({ bounceable: true, testOnly: false }),
    lpLock: lpLock.address.toString({ bounceable: true, testOnly: false }),
    sequence: [
      {
        step: 1,
        action: "Change JettonMinter owner to pool",
        tonconnect: {
          validUntil,
          messages: [{
            address: minter.address.toString({ bounceable: true, testOnly: false }),
            amount: toNano("0.05").toString(),
            payload: changeOwnerPayload
          }]
        }
      },
      {
        step: 2,
        action: "Configure launch phase lock",
        tonconnect: {
          validUntil,
          messages: [{
            address: minter.address.toString({ bounceable: true, testOnly: false }),
            amount: toNano("0.05").toString(),
            payload: configureLaunchPayload
          }]
        }
      },
      {
        step: 3,
        action: "Register pool in factory",
        tonconnect: {
          validUntil,
          messages: [{
            address: factory,
            amount: toNano("0.15").toString(),
            payload: registerPoolPayload
          }]
        }
      }
    ],
    note: "Deploy/create messages still need manual wallet signing. Execute in order and save tx hashes."
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
