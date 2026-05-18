import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();

const grepSafe = (pattern: string, include = "src public indexer contracts scripts docs .env.example .env.local.example") => {
  try {
    return execSync(
      `grep -RInE ${JSON.stringify(pattern)} ${include} --exclude-dir=node_modules --exclude-dir=.next --exclude=scripts/checkSecurity.ts`,
      { cwd: root, stdio: ["ignore", "pipe", "ignore"] }
    ).toString().trim();
  } catch {
    return "";
  }
};

const failures: string[] = [];

const withdrawHits = grepSafe("adminWithdraw|ownerWithdraw|creatorWithdraw|emergencyWithdraw|rescueCollectedTon|sweepPoolTon", "contracts src");
if (withdrawHits) failures.push(`Forbidden withdraw surface found:\n${withdrawHits}`);

const uiSourceFiles = execSync(
  "find src public scripts indexer -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.json' \\) ! -name 'checkSecurity.ts'",
  { cwd: root, stdio: ["ignore", "pipe", "ignore"] }
).toString().trim().split("\n").filter(Boolean);

const fakePrefixes = ["factory_", "bonding_", "jetton_", "migrator_", "vesting_"];
const fakeHits: string[] = [];
for (const file of uiSourceFiles) {
  const content = readFileSync(join(root, file), "utf8");
  for (const literal of fakePrefixes) {
    if (
      content.includes(`\`${literal}`) ||
      content.includes(`"${literal}`) ||
      content.includes(`'${literal}`) ||
      content.includes(`:${literal}`)
    ) {
      fakeHits.push(file);
      break;
    }
  }
}
if (fakeHits.length) failures.push(`Fake address placeholder literal found in: ${fakeHits.join(", ")}`);

const postFinancialMutationHits = grepSafe("live:.*\\+ 25|MOCK_READY", "src");
if (postFinancialMutationHits) failures.push(`Mock financial/runtime pattern found:\n${postFinancialMutationHits}`);

const manifestPath = join(root, "public/tonconnect-manifest.json");
if (!existsSync(manifestPath)) failures.push("Manifest missing");
else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.url !== "https://torgovyi-flat.vercel.app/") failures.push("Wrong manifest url");
  if (manifest.iconUrl?.endsWith(".svg")) failures.push("SVG manifest icon is forbidden");
}

const privateKeyHits = grepSafe("(BEGIN PRIVATE KEY|ed25519 secret key)", "src public indexer contracts docs");
if (privateKeyHits) failures.push(`Potential private key material found:\n${privateKeyHits}`);

const leakedPublicSecretHits = grepSafe("NEXT_PUBLIC_.*(SECRET|PRIVATE_KEY|MNEMONIC)", ".env.example .env.local.example src");
if (leakedPublicSecretHits) failures.push(`Public secret-like env name found:\n${leakedPublicSecretHits}`);

if (existsSync(join(root, ".env"))) failures.push(".env file must not be committed/used in repo state check");

if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
