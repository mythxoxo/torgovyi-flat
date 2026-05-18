import { Address } from "@ton/core";
import { TonClient, JettonMaster } from "@ton/ton";
import { JettonWallet } from "../build/jetton-minter/JettonMinter_JettonWallet";

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : "https://toncenter.com/api/v2/jsonRPC";

async function main() {
  const masterArg = process.argv[2];
  const buyerArg = process.argv[3];
  if (!masterArg || !buyerArg) {
    throw new Error("Usage: npm run check:buyer-jettons -- <jettonMaster> <buyerAddress>");
  }

  const client = new TonClient({ endpoint });
  const master = JettonMaster.create(Address.parse(masterArg));
  const buyer = Address.parse(buyerArg);
  const walletAddress = await client.open(master).getWalletAddress(buyer);
  const wallet = client.open(JettonWallet.fromAddress(walletAddress));
  const data = await wallet.getGetWalletData();

  console.log(JSON.stringify({
    walletAddress: walletAddress.toString({ bounceable: true, testOnly: false }),
    balance: data.balance.toString(),
    owner: data.owner.toString({ bounceable: true, testOnly: false }),
    master: data.master.toString({ bounceable: true, testOnly: false })
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
