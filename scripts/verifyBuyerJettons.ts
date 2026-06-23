import { existsSync, readFileSync } from "node:fs";
import { Address } from "@ton/core";
import { TonClient, JettonMaster } from "@ton/ton";
import { JettonWallet } from "../build/jetton-minter/JettonMinter_JettonWallet";


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
loadLocalEnv('.env.local');
loadLocalEnv('.env.production');

const endpoint = process.env.TONCENTER_API_KEY ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}` : "https://toncenter.com/api/v2/jsonRPC";
function arg(name: string) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : undefined; }

async function main() {
  const jettonArg = arg("--jetton");
  const buyerArg = arg("--buyer");
  if (!jettonArg || !buyerArg) throw new Error("Usage: npm run verify:buyer-jettons -- --jetton <jetton> --buyer <buyer>");
  const client = new TonClient({ endpoint });
  const master = JettonMaster.create(Address.parse(jettonArg));
  const buyer = Address.parse(buyerArg);
  const walletAddress = await client.open(master).getWalletAddress(buyer);
  const wallet = client.open(JettonWallet.fromAddress(walletAddress));
  const data = await wallet.getGetWalletData();
  console.log(JSON.stringify({ jetton: jettonArg, buyer: buyerArg, walletAddress: walletAddress.toString({ bounceable: true, testOnly: false }), balance: data.balance.toString() }, null, 2));
}
main().catch((error)=>{console.error(error);process.exit(1);});
