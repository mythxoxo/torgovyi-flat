import { readFileSync, existsSync } from "node:fs";

const waitForArtifacts = async (paths: string[], timeoutMs = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (paths.every((file) => existsSync(file))) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
};

const required = [
  "build/launchpad-factory/LaunchpadFactory_LaunchpadFactory.abi",
  "build/launchpad-factory/LaunchpadFactory_LaunchpadFactory.code.boc",
  "build/launchpad-pool/LaunchpadPool_LaunchpadPool.abi",
  "build/launchpad-pool/LaunchpadPool_LaunchpadPool.code.boc",
  "build/jetton-minter/JettonMinter_JettonMinter.abi",
  "build/jetton-minter/JettonMinter_JettonMinter.code.boc",
  "build/jetton-minter/JettonMinter_JettonWallet.abi",
  "build/jetton-minter/JettonMinter_JettonWallet.code.boc",
  "build/lp-lock/LPLock_LPLock.abi",
  "build/lp-lock/LPLock_LPLock.code.boc"
];

const main = async () => {
  await waitForArtifacts(required);

  for (const file of required) {
  if (!existsSync(file)) {
    throw new Error(`Missing build artifact: ${file}`);
  }
}

const poolAbi = JSON.parse(readFileSync("build/launchpad-pool/LaunchpadPool_LaunchpadPool.abi", "utf8"));
const factoryAbi = JSON.parse(readFileSync("build/launchpad-factory/LaunchpadFactory_LaunchpadFactory.abi", "utf8"));
const lpLockAbi = JSON.parse(readFileSync("build/lp-lock/LPLock_LPLock.abi", "utf8"));
const jettonAbi = JSON.parse(readFileSync("build/jetton-minter/JettonMinter_JettonMinter.abi", "utf8"));

for (const getter of [
  "get_state",
  "get_collected_ton",
  "get_target_ton",
  "get_creator",
  "get_jetton_master",
  "get_sold_tokens",
  "get_is_graduated",
  "get_is_listed",
  "get_lp_lock"
]) {
  if (!poolAbi.getters.find((x: { name: string }) => x.name === getter)) {
    throw new Error(`Missing pool getter: ${getter}`);
  }
}

for (const getter of ["get_pool_count", "get_pool_address", "get_pool_jetton", "get_pool_creator", "get_owner"]) {
  if (!factoryAbi.getters.find((x: { name: string }) => x.name === getter)) {
    throw new Error(`Missing factory getter: ${getter}`);
  }
}

for (const getter of ["get_locked_lp", "get_unlock_time", "get_beneficiary", "get_is_permanent"]) {
  if (!lpLockAbi.getters.find((x: { name: string }) => x.name === getter)) {
    throw new Error(`Missing LP lock getter: ${getter}`);
  }
}

for (const getter of ["get_jetton_data", "get_wallet_address"]) {
  if (!jettonAbi.getters.find((x: { name: string }) => x.name === getter)) {
    throw new Error(`Missing jetton minter getter: ${getter}`);
  }
}

console.log(JSON.stringify({ ok: true }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
