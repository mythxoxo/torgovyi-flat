import { execSync } from 'node:child_process';
const fromCodes = (...codes: number[]) => String.fromCharCode(...codes);
const patterns = [
  fromCodes(105,110,118,101,115,116,111,114),
  fromCodes(112,105,116,99,104),
  ['DATABASE','_URL',' is ','required'].join(''),
  '-- ' + 'live',
  'Launch ' + 'fast',
  fromCodes(71,97,115,80,117,109,112),
  '\\$gas'
];
const scopes = [
  'README.md',
  'public',
  'review-package',
  'src/components',
  'src/lib/telegram.ts'
].join(' ');
const cmd = `grep -RniE "${patterns.join('|')}" ${scopes} --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git || true`;
const out = execSync(cmd, { encoding: 'utf8', shell: '/bin/bash' }).trim();
if (out) {
  console.error(out);
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }, null, 2));
