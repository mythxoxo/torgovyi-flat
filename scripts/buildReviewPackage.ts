import { mkdirSync, rmSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const base = 'review-package/TONK_MEM_REVIEW_PACKAGE';
rmSync(base, { recursive: true, force: true });
mkdirSync(base, { recursive: true });
const files: Record<string,string> = {
  'README_REVIEW.md': `TONK.MEM is a TON meme token launchpad.\n\nThe product supports manual wallet signing, a 5 TON test target, an 8888 TON production target, and a DeDust-first liquidity path.\n\nVerified locally:\n- contracts build\n- sandbox buy/mint flow\n- TonConnect payload preparation\n- production build\n- security check\n\nNot live-proven yet:\n- mainnet deploy\n- real buy\n- DeDust liquidity proof\n- LP proof\n- full indexer proof\n`,
  'PROJECT_OVERVIEW.md': `TONK.MEM lets users create meme tokens on TON, trade through a bonding phase, and prepare migration to DeDust liquidity after the target is reached.`,
  'PROJECT_STATUS.md': `VERIFIED:\n- production frontend deployed\n- homepage works\n- create page works\n- technical status works\n- TonConnect modal opens\n- contracts build passes\n- contract verification passes\n- sandbox buy/mint flow passes\n- security check passes\n- production build passes\n- fake live stats removed\n- raw DB error hidden\n- no secrets tracked\n\nNOT VERIFIED:\n- live mainnet deploy\n- live buy\n- live DeDust pool proof\n- live LP proof\n- live indexer DB proof\n`,
  'TECHNICAL_ARCHITECTURE.md': `Core flow: LaunchpadFactory -> LaunchpadPool -> JettonMinter/JettonWallet -> target reached -> DeDust draft -> manual wallet signing -> live proof later.`,
  'SECURITY_REVIEW.md': `No mnemonic flow. No custody. Manual wallet signing only. DB acts as optional cache layer. Live liquidity proof still pending.`,
  'TEST_EVIDENCE.md': `Use EVIDENCE/checks.txt for command outputs.`,
  'RISK_REGISTER.md': `Main risks: live deploy not proven, DeDust proof pending, LP proof pending, indexer DB proof pending, manual signing error risk.`,
  'ROADMAP_TO_LAUNCH.md': `1. Manual deploy test\n2. Manual buy proof\n3. DeDust liquidity proof\n4. LP proof\n5. DB proof`,
  'SCREENSHOT_CHECKLIST.md': `homepage_desktop\nhomepage_mobile\ncreate_desktop\ncreate_mobile\ntechnical_status_desktop\ntechnical_status_mobile\ntonconnect_modal_homepage\ntonconnect_modal_create`,
  'MAINNET_MANUAL_TEST_FLOW.md': `Use prepare scripts, sign manually in wallet, store tx hashes, verify on-chain state, then confirm DeDust pool proof.`
};
for (const [name,content] of Object.entries(files)) writeFileSync(`${base}/${name}`, content);
mkdirSync(`${base}/SCREENSHOTS`, { recursive: true });
mkdirSync(`${base}/EVIDENCE`, { recursive: true });
writeFileSync(`${base}/SCREENSHOTS/SCREENSHOTS_NOT_CAPTURED.txt`, 'Screenshots were not captured because dedicated screenshot export tooling was unavailable in this session.\n');
for (const doc of ['docs/PROJECT_STATUS.md','docs/PROJECT_OVERVIEW.md','docs/TECHNICAL_ARCHITECTURE.md','docs/SECURITY_REVIEW.md','docs/TEST_EVIDENCE.md','docs/RISK_REGISTER.md','docs/ROADMAP_TO_LAUNCH.md']) {
 if (existsSync(doc)) copyFileSync(doc, `${base}/${doc.split('/').pop()}`);
}
execSync(`cd review-package && rm -f TONK_MEM_REVIEW_PACKAGE.zip && zip -r TONK_MEM_REVIEW_PACKAGE.zip TONK_MEM_REVIEW_PACKAGE -x "*.env*" -x "*mnemonic*" -x "*secret*" -x "*.key" -x "node_modules/*" -x ".git/*"`, { stdio: 'inherit', shell: '/bin/bash' });
console.log(JSON.stringify({ ok: true, zip: 'review-package/TONK_MEM_REVIEW_PACKAGE.zip' }, null, 2));
