import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { getLaunchpadTargetTon, PRODUCTION_TARGET_TON } from "../src/lib/launch-config";

const targetTon = getLaunchpadTargetTon();
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || "";
const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || null;
const toncenter = Boolean(process.env.TONCENTER_API_KEY);
const tonapi = Boolean(process.env.TONAPI_API_KEY);
const db = Boolean(process.env.DATABASE_URL);
const noSecretsTracked = execSync("git ls-files .env .env.local .env.production .env.production.local '*key*' 'mnemonic*' 'secrets*'", { stdio: ['ignore','pipe','ignore'] }).toString().trim() === "";

const checks = {
  appUrl: /^https?:\/\//.test(appUrl),
  manifestUrl: /^https?:\/\//.test(manifestUrl),
  targetValid: Number.isFinite(targetTon) && targetTon > 0,
  testModeAllowed: targetTon === 5 || targetTon === PRODUCTION_TARGET_TON,
  buildArtifacts: existsSync("build/launchpad-factory") && existsSync("build/launchpad-pool") && existsSync("build/jetton-minter"),
  noSecretsTracked,
  toncenter,
  tonapi,
  db
};

const investorReadinessScore = [checks.targetValid, checks.buildArtifacts, checks.noSecretsTracked, checks.appUrl, checks.manifestUrl].filter(Boolean).length / 5;
const preLiveMainnetReadinessScore = [checks.targetValid, checks.buildArtifacts, checks.noSecretsTracked, checks.appUrl, checks.manifestUrl, checks.toncenter, checks.tonapi].filter(Boolean).length / 7;

const missingForLive = [
  !factory ? "NEXT_PUBLIC_FACTORY_ADDRESS after manual deploy" : null,
  !db ? "DATABASE_URL for indexer DB proof" : null,
  !toncenter ? "TONCENTER_API_KEY" : null,
  !tonapi ? "TONAPI_API_KEY" : null,
  targetTon !== 5 && targetTon !== PRODUCTION_TARGET_TON ? "valid target config" : null,
  "TON funds",
  "manual wallet signing",
  "live tx hashes"
].filter(Boolean);

console.log(JSON.stringify({
  investorReadinessScore: Math.round(investorReadinessScore * 100),
  preLiveMainnetReadinessScore: Math.round(preLiveMainnetReadinessScore * 100),
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
