# PROJECT STATUS

## VERIFIED

- sandbox buy/mint loop verified
- live mainnet buy path was proven earlier for the corrected pool flow
- production build passes
- contract verification passes
- security check passes
- factory registry/state machine tests pass
- indexer dry-run passes without DATABASE_URL
- no backend custody path
- no fake balances in core loop

## CURRENT PRODUCT STATE

- launch registry/factory works as authoritative registry and validation layer
- buy flow is live-proven and platform-driven
- sell flow is manual-sign / verification-driven and no longer returns fake 501 success
- listing intent exists for the known live pool
- DeDust verification now fails with concrete reasons when liquidity/LP proof is absent
- referral bindings/accounting/claim requests persist locally when DB is absent
- indexer persists minimal token/trade-like state without DATABASE_URL

## STILL NOT VERIFIED LIVE

- external DeDust liquidity pool creation for the known live pool
- LP lock proof for the known live pool
- claim payout execution on chain
- full sell classification from live chain evidence
- automated referral reward accrual from live indexed buys

## INFRASTRUCTURE NOTE

- public preview still relies on manual indexer runs (`npm run index:once`, `npm run index:dry-run`)
- blockchain remains source of truth; indexer is cache/derived state
