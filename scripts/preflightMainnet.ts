import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { getLaunchpadTargetTon, PRODUCTION_TARGET_TON } from "../src/lib/launch-config";
import { validateProjectWallets } from "../src/lib/project-wallets";

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

const targetTon = getLaunchpadTargetTon();
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || "";
const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || null;
const toncenter = Boolean(process.env.TONCENTER_API_KEY);
const tonapi = Boolean(process.env.TONAPI_API_KEY);
const db = Boolean(process.env.DATABASE_URL);
const noSecretsTracked = execSync("git ls-files .env .env.local .env.production .env.production.local '*key*' 'mnemonic*' 'secrets*'", { stdio: ['ignore','pipe','ignore'] }).toString().trim() === "";
const walletValidation = validateProjectWallets();

const checks = {
  appUrl: /^https?:\/\//.test(appUrl),
  manifestUrl: /^https?:\/\//.test(manifestUrl),
  targetValid: Number.isFinite(targetTon) && targetTon > 0,
  testModeAllowed: targetTon === 5 || targetTon === PRODUCTION_TARGET_TON,
  buildArtifacts: existsSync("build/launchpad-factory") && existsSync("build/launchpad-pool") && existsSync("build/jetton-minter"),
  noSecretsTracked,
  toncenter,
  tonapi,
  db,
  factory: Boolean(factory),
  dedustFirst: true,
  treasury: Boolean(walletValidation.wallets.treasury),
  owner: Boolean(walletValidation.wallets.owner),
  deployer: Boolean(walletValidation.wallets.deployer),
  operator: Boolean(walletValidation.wallets.operator),
  liquidity: Boolean(walletValidation.wallets.liquidity)
};

const missingForLive = [
  !factory ? "NEXT_PUBLIC_FACTORY_ADDRESS after manual deploy" : null,
  !db ? "DATABASE_URL for indexer DB proof" : null,
  ...walletValidation.missing.map((role) => `${role} wallet`),
  ...walletValidation.invalid.map((role) => `${role} wallet invalid`),
  "TON funds",
  "manual wallet signing",
  "live tx hashes"
].filter(Boolean);

const publicProductReadinessScore = Math.round(([
  checks.appUrl,
  checks.manifestUrl,
  checks.targetValid,
  checks.testModeAllowed,
  checks.buildArtifacts,
  checks.noSecretsTracked,
  checks.treasury,
  checks.owner,
  checks.deployer,
  checks.operator,
  checks.liquidity
].filter(Boolean).length / 11) * 100);

const preLiveMainnetReadinessScore = Math.round(([
  checks.appUrl,
  checks.manifestUrl,
  checks.targetValid,
  checks.buildArtifacts,
  checks.noSecretsTracked,
  checks.toncenter,
  checks.tonapi,
  checks.db,
  checks.factory,
  checks.treasury,
  checks.owner,
  checks.deployer,
  checks.operator,
  checks.liquidity
].filter(Boolean).length / 14) * 100);

console.log(JSON.stringify({
  ok: walletValidation.ok,
  wallets: {
    treasury: walletValidation.wallets.treasury ? "set" : "missing",
    owner: walletValidation.wallets.owner ? "set" : "missing",
    deployer: walletValidation.wallets.deployer ? "set" : "missing",
    operator: walletValidation.wallets.operator ? "set" : "missing",
    liquidity: walletValidation.wallets.liquidity ? "set" : "missing"
  },
  missing: walletValidation.missing,
  invalid: walletValidation.invalid,
  publicProductReadinessScore,
  preLiveMainnetReadinessScore,
  targetTon,
  productionTargetTon: PRODUCTION_TARGET_TON,
  testMode: targetTon !== PRODUCTION_TARGET_TON,
  factory,
  checks,
  missingForLive,
  nextActions: [
    "Run prepare TonConnect scripts",
    "Manually sign Factory deploy",
    "Manually sign token flow deploy + ChangeOwner + RegisterPool",
    "Run live buy with small TON",
    "Run verify scripts and index:once"
  ]
}, null, 2));
