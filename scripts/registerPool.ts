import { Address, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1 } from "@ton/ton";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { LPLock } from "../build/lp-lock/LPLock_LPLock";
import { upsertTokenRow } from "../src/lib/server/indexer-store";
import { DEFAULT_TEST_TARGET_TON } from "../src/lib/launch-config";

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : "https://toncenter.com/api/v2/jsonRPC";

async function main() {
  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONK_MEM_DEPLOYER_MNEMONIC;
  const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  const creatorAddress = process.env.EXAMPLE_CREATOR_ADDRESS;
  const jettonMasterAddress = process.env.EXAMPLE_JETTON_MASTER_ADDRESS;
  const targetTon = Number(process.env.LAUNCHPAD_TARGET_TON || DEFAULT_TEST_TARGET_TON);

  if (!mnemonic) throw new Error("DEPLOYER_MNEMONIC is required");
  if (!factoryAddress) throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS is required");
  if (!creatorAddress) throw new Error("EXAMPLE_CREATOR_ADDRESS is required");
  if (!jettonMasterAddress) throw new Error("EXAMPLE_JETTON_MASTER_ADDRESS is required");

  const creator = Address.parse(creatorAddress);
  const jettonMaster = Address.parse(jettonMasterAddress);
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const sender = client.open(wallet).sender(keyPair.secretKey);

  const lpLock = await LPLock.fromInit(creator, 0n, true);
  const pool = await LaunchpadPool.fromInit(creator, jettonMaster, lpLock.address, toNano(String(targetTon)));
  const factory = client.open(LaunchpadFactory.fromAddress(Address.parse(factoryAddress)));

  const summary = {
    creator: creator.toString({ bounceable: true, testOnly: false }),
    jettonMaster: jettonMaster.toString({ bounceable: true, testOnly: false }),
    lpLock: lpLock.address.toString({ bounceable: true, testOnly: false }),
    pool: pool.address.toString({ bounceable: true, testOnly: false }),
    targetTon
  };

  console.log(JSON.stringify({ mode: process.argv.includes("--execute") ? "execute" : "dry-run", ...summary }, null, 2));

  if (!process.argv.includes("--execute")) return;

  await factory.send(sender, { value: toNano("0.15") }, {
    $$type: "RegisterPool",
    pool: pool.address,
    jettonMaster,
    creator
  });

  await upsertTokenRow({
    pool_address: summary.pool,
    jetton_address: summary.jettonMaster,
    creator: summary.creator,
    name: process.env.EXAMPLE_TOKEN_NAME || "Registered Token",
    symbol: process.env.EXAMPLE_TOKEN_SYMBOL || "REG",
    description: "registered via factory fallback path",
    image_url: null,
    collected_ton: 0,
    target_ton: targetTon,
    sold_tokens: 0,
    status: "BONDING",
    is_listed: false,
    lp_lock_address: summary.lpLock,
    dedust_pool_address: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
