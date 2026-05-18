import { Address, beginCell, toNano } from "@ton/core";
import { storeRegisterPool } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function parseRequiredAddress(value: string | undefined, label: string) {
  if (!value || !value.trim()) throw new Error(`${label} is required`);
  try {
    return Address.parse(value.trim());
  } catch {
    throw new Error(`${label} is invalid`);
  }
}

async function main() {
  const factory = parseRequiredAddress(arg("--factory") || process.env.NEXT_PUBLIC_FACTORY_ADDRESS, "factory");
  const pool = parseRequiredAddress(arg("--pool") || process.env.EXAMPLE_POOL_ADDRESS, "pool");
  const jetton = parseRequiredAddress(arg("--jetton") || process.env.EXAMPLE_JETTON_MASTER_ADDRESS, "jetton");
  const creator = parseRequiredAddress(arg("--creator") || process.env.EXAMPLE_CREATOR_ADDRESS || process.env.FACTORY_OWNER_ADDRESS, "creator");

  const validUntil = Math.floor(Date.now() / 1000) + 300;
  const payload = beginCell().store(storeRegisterPool({ $$type: "RegisterPool", pool, jettonMaster: jetton, creator })).endCell().toBoc().toString("base64");
  const tx = { validUntil, messages: [{ address: factory.toString({ bounceable: true, testOnly: false }), amount: toNano("0.15").toString(), payload }] };

  console.log(JSON.stringify({
    ok: true,
    summary: "Register Pool/Jetton pair in Factory registry",
    destination: tx.messages[0].address,
    value: tx.messages[0].amount,
    payload,
    stateInit: null,
    validUntil,
    tonconnect: tx
  }, null, 2));
}
main().catch((error)=>{console.error(error);process.exit(1);});
