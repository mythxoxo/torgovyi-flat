import { getProjectWallets } from "../src/lib/project-wallets";

const wallets = getProjectWallets();
console.log(JSON.stringify({
  ok: true,
  liquidityWallet: wallets.liquidity || null,
  ownerWallet: wallets.owner || null,
  deployerWallet: wallets.deployer || null,
  treasuryWallet: wallets.treasury || null,
  operatorWallet: wallets.operator || null,
}, null, 2));
