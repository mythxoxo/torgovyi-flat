import { beginCell, Address, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { LPLock } from "../build/lp-lock/LPLock_LPLock";
import { JettonMinter } from "../build/jetton-minter/JettonMinter_JettonMinter";
import { DEFAULT_TEST_TARGET_TON, PRODUCTION_TARGET_TON } from "../src/lib/launch-config";

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : "https://toncenter.com/api/v2/jsonRPC";
const FALLBACK_CREATOR = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");
  if (!dryRun && !execute) throw new Error("Pass --dry-run or --execute");

  const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "UNSET_FACTORY";
  const creator = Address.parse(process.env.EXAMPLE_CREATOR_ADDRESS || process.env.FACTORY_OWNER_ADDRESS || FALLBACK_CREATOR);
  const targetTon = Number(arg("--target") || process.env.LAUNCHPAD_TARGET_TON || DEFAULT_TEST_TARGET_TON);

  const lpLock = await LPLock.fromInit(creator, 0n, true);
  const tempMinter = await JettonMinter.fromInit(0n, creator, beginCell().endCell(), creator, false);
  const pool = await LaunchpadPool.fromInit(creator, tempMinter.address, lpLock.address, toNano(String(targetTon)));
  const minter = await JettonMinter.fromInit(0n, creator, beginCell().endCell(), creator, false);

  console.log(JSON.stringify({
    mode: dryRun ? "dry-run" : "execute",
    network: process.argv.includes("--network") ? process.argv[process.argv.indexOf("--network") + 1] : "mainnet",
    factoryAddress,
    creator: creator.toString({ bounceable: true, testOnly: false }),
    targetTon,
    productionTargetTon: PRODUCTION_TARGET_TON,
    testMode: targetTon !== PRODUCTION_TARGET_TON,
    lpLock: lpLock.address.toString({ bounceable: true, testOnly: false }),
    jettonMaster: minter.address.toString({ bounceable: true, testOnly: false }),
    pool: pool.address.toString({ bounceable: true, testOnly: false }),
    requiredFlow: [
      "1) deploy JettonMinter with owner=creator",
      "2) deploy Pool pointing to JettonMinter and targetTon",
      "3) send ChangeOwner on JettonMinter to Pool address",
      "4) verify get_jetton_data adminAddress == Pool",
      "5) register pair in Factory via RegisterPool"
    ]
  }, null, 2));

  if (dryRun) return;

  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error("DEPLOYER_MNEMONIC is required");
  if (!process.env.NEXT_PUBLIC_FACTORY_ADDRESS) throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS is required");

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  void client.open(wallet).sender(keyPair.secretKey);

  console.log("Execute sequence must be confirmed step-by-step. Save tx hashes for deploy/change-owner/register.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
