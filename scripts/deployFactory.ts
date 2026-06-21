import { Address, beginCell, contractAddress, storeStateInit, toNano } from "@ton/core";
import { existsSync, readFileSync } from "node:fs";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { getProjectWallets } from "../src/lib/project-wallets";

const FALLBACK_OWNER = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
const DEPLOY_VALUE = toNano("0.2");
const VALID_FOR_SECONDS = 300;

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

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");
  if (!dryRun && !execute) throw new Error("Pass --dry-run or --execute");

  const wallets = getProjectWallets();
  const owner = Address.parse(wallets.owner || process.env.FACTORY_OWNER_ADDRESS || FALLBACK_OWNER);
  const factory = await LaunchpadFactory.fromInit(owner);
  const stateInit = factory.init;
  if (!stateInit) throw new Error("Factory init is required");

  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();
  const deployAddress = contractAddress(0, stateInit).toString({ bounceable: true, testOnly: false });
  const validUntil = Math.floor(Date.now() / 1000) + VALID_FOR_SECONDS;

  console.log(JSON.stringify({
    mode: dryRun ? "dry-run" : "execute",
    network: process.env.TON_NETWORK || process.env.NEXT_PUBLIC_TON_NETWORK || "mainnet",
    factoryAddress: factory.address.toString({ bounceable: true, testOnly: false }),
    owner: owner.toString({ bounceable: true, testOnly: false }),
    deployAddress,
    value: DEPLOY_VALUE.toString(),
    stateInit: stateInitCell.toBoc().toString("base64"),
    validUntil,
    tonConnect: {
      validUntil,
      messages: [{
        address: deployAddress,
        amount: DEPLOY_VALUE.toString(),
        stateInit: stateInitCell.toBoc().toString("base64")
      }]
    },
    note: execute ? "Manual TonConnect deployment is required; sign the payload from tonConnect." : "Dry-run prepared."
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
