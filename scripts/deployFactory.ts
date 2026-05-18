import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { Address } from "@ton/core";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : "https://toncenter.com/api/v2/jsonRPC";
const FALLBACK_OWNER = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");
  if (!dryRun && !execute) throw new Error("Pass --dry-run or --execute");

  const owner = Address.parse(process.env.FACTORY_OWNER_ADDRESS || FALLBACK_OWNER);
  const factory = await LaunchpadFactory.fromInit(owner);

  console.log(JSON.stringify({
    mode: dryRun ? "dry-run" : "execute",
    network: process.argv.includes("--network") ? process.argv[process.argv.indexOf("--network") + 1] : "mainnet",
    factoryAddress: factory.address.toString({ bounceable: true, testOnly: false }),
    owner: owner.toString({ bounceable: true, testOnly: false })
  }, null, 2));

  if (dryRun) return;

  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error("DEPLOYER_MNEMONIC is required");

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const sender = client.open(wallet).sender(keyPair.secretKey);

  await client.open(factory).send(sender, { value: 200000000n }, {
    $$type: "CreateToken",
    name: "BOOT",
    symbol: "BOOT",
    description: "bootstrap tx",
    imageUrl: "https://torgovyi-flat.vercel.app/brand/img_02.jpg",
    totalSupply: 1n,
    creator: owner,
    curveTarget: 8888000000000n,
    minBuy: 50000000n,
    feeBps: 75n
  });

  console.log("Save deployment tx hash from wallet/explorer.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
