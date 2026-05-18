import { beginCell, toNano } from "@ton/core";
import { Blockchain } from "@ton/sandbox";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";
import { JettonMinter } from "../build/jetton-minter/JettonMinter_JettonMinter";
import { JettonWallet } from "../build/jetton-minter/JettonMinter_JettonWallet";
import { LPLock } from "../build/lp-lock/LPLock_LPLock";
import { DEFAULT_TEST_TARGET_TON } from "../src/lib/launch-config";

async function main() {
  const blockchain = await Blockchain.create();
  blockchain.verbosity.print = false;

  const creator = await blockchain.treasury("creator");
  const buyer = await blockchain.treasury("buyer");

  const lpLock = blockchain.openContract(await LPLock.fromInit(creator.address, 0n, true));
  const tempMinter = await JettonMinter.fromInit(0n, creator.address, beginCell().endCell());
  const pool = blockchain.openContract(await LaunchpadPool.fromInit(creator.address, tempMinter.address, lpLock.address, toNano(String(DEFAULT_TEST_TARGET_TON))));
  const minter = blockchain.openContract(await JettonMinter.fromInit(0n, creator.address, beginCell().endCell()));

  const deployMinter = await minter.send(
    creator.getSender(),
    { value: toNano("0.2") },
    {
      $$type: "ChangeOwner",
      queryId: 0n,
      newOwner: pool.address
    }
  );

  const buyResult = await pool.send(
    buyer.getSender(),
    { value: toNano("2") },
    {
      $$type: "Buy",
      referral: null,
      minTokensOut: 1n,
    }
  );

  const collected = await pool.getGetCollectedTon();
  const sold = await pool.getGetSoldTokens();
  const targetTon = await pool.getGetTargetTon();
  const buyerWalletAddress = await minter.getGetWalletAddress(buyer.address);
  const buyerWallet = blockchain.openContract(JettonWallet.fromAddress(buyerWalletAddress));
  const buyerJettons = await buyerWallet.getGetWalletData();

  console.log(JSON.stringify({
    ok: true,
    ownerTransferTxCount: deployMinter.transactions.length,
    buyTxCount: buyResult.transactions.length,
    targetTon: targetTon.toString(),
    collectedTon: collected.toString(),
    soldTokens: sold.toString(),
    buyerJettonWallet: buyerWalletAddress.toString(),
    buyerJettonBalance: buyerJettons.balance.toString()
  }, null, 2));

  if (collected <= 0n) throw new Error("collectedTon was not updated");
  if (sold <= 0n) throw new Error("soldTokens was not updated");
  if (buyerJettons.balance <= 0n) throw new Error("buyer did not receive jettons");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
