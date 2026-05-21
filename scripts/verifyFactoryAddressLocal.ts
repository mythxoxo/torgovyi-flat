import { existsSync, readFileSync } from "node:fs";
import { Address, beginCell, contractAddress, storeStateInit, toNano } from "@ton/core";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import { getProjectWallets } from "../src/lib/project-wallets";
import { formatAddressVariants, sameTonAddress } from "../src/lib/ton-address";

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
  const wallets = getProjectWallets();
  const expectedOwnerInput = process.env.TONK_MEM_OWNER_ADDRESS || process.env.TONK_OWNER_ADDRESS || process.env.FACTORY_OWNER_ADDRESS || FALLBACK_OWNER;
  const owner = Address.parse(wallets.owner || expectedOwnerInput);
  const factory = await LaunchpadFactory.fromInit(owner);
  const stateInit = factory.init;
  if (!stateInit) throw new Error("Factory init is required");

  const expectedOwner = formatAddressVariants(expectedOwnerInput);
  const actualOwner = formatAddressVariants(owner.toString({ bounceable: false, testOnly: false, urlSafe: true }));
  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();
  const factoryAddressFromStateInit = contractAddress(0, stateInit).toString({ bounceable: true, testOnly: false });
  const validUntil = Math.floor(Date.now() / 1000) + VALID_FOR_SECONDS;
  const factoryAddressFromPrepare = factory.address.toString({ bounceable: true, testOnly: false });

  console.log(JSON.stringify({
    ok: true,
    network: process.env.TON_NETWORK || process.env.NEXT_PUBLIC_TON_NETWORK || "mainnet",
    expectedOwnerNonBounceable: expectedOwner.nonBounceable,
    actualOwnerNonBounceable: actualOwner.nonBounceable,
    expectedOwnerBounceable: expectedOwner.bounceable,
    actualOwnerBounceable: actualOwner.bounceable,
    expectedOwnerRaw: expectedOwner.raw,
    actualOwnerRaw: actualOwner.raw,
    sameOwnerRaw: sameTonAddress(expectedOwnerInput, owner.toString({ bounceable: true, testOnly: false, urlSafe: true })),
    factoryAddressFromPrepare,
    factoryAddressFromStateInit,
    sameAddress: factoryAddressFromPrepare === factoryAddressFromStateInit,
    stateInitPresent: stateInitCell.bits.length > 0,
    validUntil,
    value: DEPLOY_VALUE.toString()
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
