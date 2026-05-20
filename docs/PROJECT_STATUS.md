# PROJECT STATUS

## VERIFIED

- sandbox buy/mint loop verified
- manual no-custody mainnet test flow ready
- production target 8888 TON retained in config model
- test target 5 TON supported in config
- no backend custody path
- no fake balances in core loop
- security check passes
- build passes

## NOT VERIFIED

- live Factory deploy
- live token-flow deploy
- live buy
- live buyer Jetton balance on mainnet
- live DeDust listing

## BLOCKED

- manual wallet signing
- TON funds for deploy/buy gas
- live tx hashes / live chain evidence

## INFRASTRUCTURE NOTE

- Vercel Hobby frequent cron is disabled for public preview mode
- indexer is manual in public preview mode via `npm run index:once` and `npm run index:dry-run`
- production worker/indexer should be moved to VPS or Vercel Pro later
