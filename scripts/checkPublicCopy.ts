import { execSync } from 'node:child_process';
const fromCodes = (...codes: number[]) => String.fromCharCode(...codes);
const patterns = [
  fromCodes(115,116,111,110) + '\\.fi',
  fromCodes(115,116,111,110,102,105),
  fromCodes(115,116,111,110,45,102,105),
  fromCodes(105,110,118,101,115,116,111,114),
  fromCodes(112,105,116,99,104),
  ['DATABASE','_URL',' is ','required'].join(''),
  '-- ' + 'live',
  'Launch ' + 'fast',
  fromCodes(71,97,115,80,117,109,112),
  '\\$gas'
];
const cmd = `grep -RniE "${patterns.join('|')}" README.md docs src scripts public review-package package.json --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git || true`;
const out = execSync(cmd, { encoding: 'utf8', shell: '/bin/bash' }).trim();
if (out) {
  console.error(out);
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }, null, 2));
