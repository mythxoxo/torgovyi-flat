# Security audit 2026-06-29

Scope: production/runtime launch flow, public API routes, DeDust/STON.fi DEX endpoints, upload surface, referral/claim paths, and secret-handling posture.

## Fixed findings

### Critical — backend custody launch executor in runtime path

**Files:**
- `src/lib/server/service-v2.ts`
- `src/lib/server/launch-executor.ts`

**Risk:** the old create-token path called a server executor that required `DEPLOYER_MNEMONIC` / `TONS_OF_GRAM_DEPLOYER_MNEMONIC`. This caused production launch failures and created an unacceptable backend-custody path.

**Fix:** create token now stages metadata after the user's TonConnect-signed transaction flow. Runtime no longer needs a deployer mnemonic for user launch. The old launch executor is disabled and returns a hard failure if accidentally called.

**Status:** fixed.

### High — weak create-token input validation

**Files:**
- `src/lib/server/service-v2.ts`

**Risk:** malformed token names, tickers, target values, image URLs, or creator wallet strings could enter staging/indexer state.

**Fix:** added server-side validation for:
- token name length `2..64`
- ticker format `A-Z0-9`, length `2..10`
- description max `500`
- image URL/path max length and safe scheme
- creator wallet via `Address.parse`
- targetTon limited to `5` or `8888`
- totalSupply positive integer
- fee/min-buy sane bounds

**Status:** fixed.

### High — upload route trusted client-side checks

**Files:**
- `src/lib/server-api.ts`

**Risk:** client-side 2 MB/type checks can be bypassed. Server accepted whatever `File` came in.

**Fix:** added server-side checks:
- max `2_000_000` bytes
- reject empty file
- allow only `image/png`, `image/jpeg`, `image/webp`
- reject SVG/executable MIME types
- sanitize original filename before storage

**Status:** fixed.

### High — DEX quote/swap malformed amount could produce 500

**Files:**
- `src/app/api/dex/quote/route.ts`
- `src/app/api/dex/swap/route.ts`

**Risk:** `BigInt(amount)` on malformed input could throw and return 500. Token/user addresses were not normalized before routing.

**Fix:** added safe parsing:
- amount must be positive integer units
- TON addresses validated and normalized via `Address.parse`
- slippage clamped to `10..2000` bps
- platform/side remain strict enums
- swap `ok` only true when `payload_ready` contains at least one real message with address/amount/payload

**Status:** fixed.

### Medium — claim/referral address and tx hash validation

**Files:**
- `src/lib/server-api.ts`

**Risk:** arbitrary strings could enter claim/referral state or be echoed back in draft/status objects.

**Fix:** added:
- wallet validation via `Address.parse`
- treasury validation before payout draft
- txHash length/charset validation
- referral code length/charset validation
- preserved self-referral block

**Status:** fixed.

## Not changed in this pass

### Dependency pinning

`package.json` still contains some `latest` ranges. This should be pinned in a separate dependency-only PR using `npm install` so `package.json` and `package-lock.json` remain consistent. I did not manually rewrite lockfile dependency metadata without a package manager run.

### DeDust sell fee

Sell still correctly returns `proxy_required_for_sell_fee` until `PlatformSwapProxy` is implemented and deployed. This is intentionally not faked.

### Full local security tooling

This pass used GitHub repository editing and Vercel/GitHub status visibility. Local-only tools such as `gitleaks`, `trufflehog`, `osv-scanner`, and `npm audit` still need to be run by the local agent/workspace for a complete machine scan.

## Verification expected

Required before merge:

```bash
npm run build
npm run verify
npm run security:check
npm run check:public-copy
npm run test:dedust-route
npm run test:dedust-quote
npm run test:dedust-buy-payload
npm run test:dedust-sell-payload
npm run test:stonfi-quote
npm run test:stonfi-buy-payload
npm run test:stonfi-sell-payload
```

Recommended local-only scans:

```bash
gitleaks detect --source .
trufflehog filesystem .
osv-scanner -r .
npm audit --omit=dev
```

## Remaining production blockers

1. `PlatformSwapProxy` for DeDust sell fee.
2. Dependency pinning PR with package-manager-generated lockfile update.
3. Local secret/dependency scanner run in the real workspace.
