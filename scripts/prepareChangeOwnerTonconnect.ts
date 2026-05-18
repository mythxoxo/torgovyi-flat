import { Address, beginCell, toNano } from "@ton/core";
import { storeChangeOwner } from "../build/jetton-minter/JettonMinter_JettonMinter";

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
  const jetton = parseRequiredAddress(arg("--jetton") || process.env.EXAMPLE_JETTON_MASTER_ADDRESS, "jetton");
  const pool = parseRequiredAddress(arg("--pool") || process.env.EXAMPLE_POOL_ADDRESS, "pool");

  const validUntil = Math.floor(Date.now() / 1000) + 300;
  const payload = beginCell().store(storeChangeOwner({ $$type: "ChangeOwner", queryId: 0n, newOwner: pool })).endCell().toBoc().toString("base64");
  const tx = { validUntil, messages: [{ address: jetton.toString({ bounceable: true, testOnly: false }), amount: toNano("0.05").toString(), payload }] };

  console.log(JSON.stringify({
    ok: true,
    summary: "Transfer JettonMinter admin to Pool",
    destination: tx.messages[0].address,
    value: tx.messages[0].amount,
    payload,
    stateInit: null,
    validUntil,
    tonconnect: tx
  }, null, 2));
}
main().catch((error)=>{console.error(error);process.exit(1);});
