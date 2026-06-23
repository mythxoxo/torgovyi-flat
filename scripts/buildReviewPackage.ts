import { mkdirSync, rmSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const base = 'review-package/TONK_MEM_REVIEW_PACKAGE';
rmSync(base, { recursive: true, force: true });
mkdirSync(base, { recursive: true });
const files: Record<string,string> = {
  'README_REVIEW.md': `TONK.MEM is a TON meme token launchpad.\n\nThe product uses manual wallet signing, a verified factory registry/state machine, persisted listing intents, and a minimal honest indexer.\n\nVerified now:\n- contracts build\n- sandbox buy/mint flow\n- factory flow tests\n- production build\n- security check\n- indexer dry-run\n- truthful DeDust verification paths\n\nStill open:\n- external liquidity proof\n- LP proof\n- claim payout execution\n- fuller sell/migration/claim classification\n`,
  'PROJECT_OVERVIEW.md': `TONK.MEM lets users create meme tokens on TON, trade through a bonding phase, and prepare post-migration liquidity after the target is reached.`,
  'PROJECT_STATUS.md': `VERIFIED:\n- production frontend deployed\n- homepage works\n- create page works\n- technical status works\n- TonConnect modal opens\n- contracts build passes\n- contract verification passes\n- sandbox buy/mint flow passes\n- factory flow tests pass\n- security check passes\n- production build passes\n- indexer dry-run passes\n\nSTILL OPEN:\n- external DeDust pool proof\n- LP proof\n- claim payout execution\n- full trade classification\n`,
  'TECHNICAL_ARCHITECTURE.md': `Core flow: LaunchpadFactory registry/state machine -> LaunchpadPool -> JettonMinter/JettonWallet -> target reached -> listing intent -> manual wallet signing -> post-exec verification.`,
  'SECURITY_REVIEW.md': `No mnemonic flow. No custody. Manual wallet signing only. DB is optional cache. Verification now fails with concrete reasons instead of fake placeholders.`,
  'TEST_EVIDENCE.md': `Use EVIDENCE/checks.txt for command outputs.`,
  'RISK_REGISTER.md': `Main risks: external liquidity still unproven, LP proof missing, claim payout unimplemented, partial indexer classification, manual signing error risk.`,
  'ROADMAP_TO_LAUNCH.md': `1. Persist listing intent\n2. Prove external liquidity\n3. Prove LP lock\n4. Implement claim payout\n5. Complete sell/migration/claim classification`,
  'SCREENSHOT_CHECKLIST.md': `homepage_desktop\nhomepage_mobile\ncreate_desktop\ncreate_mobile\ntechnical_status_desktop\ntechnical_status_mobile\ntonconnect_modal_homepage\ntonconnect_modal_create`,
  'MAINNET_MANUAL_TEST_FLOW.md': `Use prepare scripts, sign manually in wallet, store tx hashes, verify on-chain state, then verify external liquidity and LP evidence.`
};
for (const [name,content] of Object.entries(files)) writeFileSync(`${base}/${name}`, content);
mkdirSync(`${base}/SCREENSHOTS`, { recursive: true });
mkdirSync(`${base}/EVIDENCE`, { recursive: true });
writeFileSync(`${base}/SCREENSHOTS/SCREENSHOTS_NOT_CAPTURED.txt`, 'Screenshots were not captured in this session.\n');
for (const doc of ['docs/PROJECT_STATUS.md','docs/PROJECT_OVERVIEW.md','docs/TECHNICAL_ARCHITECTURE.md','docs/SECURITY_REVIEW.md','docs/TEST_EVIDENCE.md','docs/RISK_REGISTER.md','docs/ROADMAP_TO_LAUNCH.md']) {
 if (existsSync(doc)) copyFileSync(doc, `${base}/${doc.split('/').pop()}`);
}
execSync(`cd review-package && rm -f TONK_MEM_REVIEW_PACKAGE.zip && zip -r TONK_MEM_REVIEW_PACKAGE.zip TONK_MEM_REVIEW_PACKAGE -x "*.env*" -x "*mnemonic*" -x "*secret*" -x "*.key" -x "node_modules/*" -x ".git/*"`, { stdio: 'inherit', shell: '/bin/bash' });
console.log(JSON.stringify({ ok: true, zip: 'review-package/TONK_MEM_REVIEW_PACKAGE.zip' }, null, 2));
