# TONK.MEM

Security-first TON meme token launchpad MVP.

## Current status

- VERIFIED: sandbox buy/mint loop
- VERIFIED: manual no-custody TonConnect payload preparation
- VERIFIED: configurable launch target
- VERIFIED: no backend custody path
- VERIFIED: no fake balances in core flow
- NOT VERIFIED: live mainnet deploy/buy proof in this repo session

## Targets

- Production target: `8888 TON`
- Manual test target: `5 TON`

Set:

- `LAUNCHPAD_TARGET_TON=5` for manual investor/test flow
- `LAUNCHPAD_TARGET_TON=8888` for production

## Safety

- backend does not custody user TON
- deploy/buy can be prepared via TonConnect/manual wallet confirmation
- execute via private-key scripts is optional and not required for manual no-custody flow
- `.env*` files must stay out of git

## Useful commands

```bash
npm install
npm run contracts:build
npm run test:buy-flow
npm run prepare:factory-tonconnect
npm run prepare:token-flow-tonconnect -- --target 5
npm run prepare:buy-tonconnect -- --pool <pool> --amount 0.05
npm run index:once
npm run index:dry-run
npm run security:check
npm run build
```

## Vercel Hobby note

- frequent Vercel cron is disabled for investor/demo deploys
- indexer is run manually for investor/demo mode
- production worker/indexer should move to VPS, separate worker, or Vercel Pro later

## Docs

- `docs/INVESTOR_STATUS.md`
- `docs/MANUAL_TEST_FLOW.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY_MODEL.md`
- `docs/RETURN_TO_8888_TARGET.md`
