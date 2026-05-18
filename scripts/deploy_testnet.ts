import { existsSync } from "node:fs";
import path from "node:path";

import { loadOptionalEnvFile, optionalString, requiredString } from "@meme-launchpad/config";
import { DEFAULT_PLATFORM_TREASURY, DEFAULT_STONFI_ROUTER } from "@meme-launchpad/shared";

loadOptionalEnvFile();

const network = optionalString(process.env.TON_NETWORK, "testnet");
const treasury = optionalString(process.env.PLATFORM_TREASURY_ADDRESS, DEFAULT_PLATFORM_TREASURY);
const router = optionalString(process.env.STONFI_ROUTER_ADDRESS, DEFAULT_STONFI_ROUTER);
const root = process.cwd();

const artifactPaths = [
  "contracts/build/JettonFactory/JettonFactory_JettonFactory.code.boc",
  "contracts/build/JettonMaster/JettonMaster_JettonMaster.code.boc",
  "contracts/build/BondingCurve/BondingCurve_BondingCurve.code.boc",
  "contracts/build/FeeVault/FeeVault_FeeVault.code.boc",
  "contracts/build/PlatformVestingVault/PlatformVestingVault_PlatformVestingVault.code.boc",
  "contracts/build/LiquidityMigrator/LiquidityMigrator_LiquidityMigrator.code.boc"
];

console.log("[DEPLOY TESTNET PLAN]");
console.log(`network: ${network}`);
console.log(`platform treasury: ${treasury}`);
console.log(`ston.fi router: ${router}`);
console.log("artifacts:");
for (const artifactPath of artifactPaths) {
  const absolutePath = path.join(root, artifactPath);
  console.log(`- ${artifactPath}: ${existsSync(absolutePath) ? "ready" : "missing"}`);
}
console.log("steps:");
console.log("1. Run `npm run contracts:build` until every artifact above is ready.");
console.log("2. Deploy JettonFactory and wire treasury addresses.");
console.log("3. Deploy FeeVault, PlatformVestingVault, and LiquidityMigrator.");
console.log("4. Point LiquidityMigrator at the real STON.fi router and pool contracts.");
console.log("5. Update bot/web/api env vars with deployed addresses.");
console.log("6. Run post-deploy sanity trades on testnet.");

try {
  requiredString(process.env.TONCENTER_API_KEY, "TONCENTER_API_KEY");
  console.log("TONCENTER_API_KEY found. Ready to replace this scaffold with real deploy calls.");
} catch (error) {
  console.warn((error as Error).message);
  console.warn("Real deployment calls are intentionally omitted in MVP until final addresses and keys are provided.");
}
