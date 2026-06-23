# KNOWN LIMITATIONS

## STILL OPEN

- external DeDust liquidity is not proven for the known live pool
- LP lock verification is not proven for the known live pool
- claim payout execution path is not implemented on chain
- referral rewards are persisted but not yet accrued automatically from indexed live buys
- indexer classification for sell / migration / claim remains partial

## CURRENT CONSTRAINTS

- factory acts as authoritative registry/state machine, but deploy orchestration is still hybrid
- manual wallet signing is still required for sensitive actions
- no backend custody path exists
- indexer may run without DATABASE_URL using local runtime persistence
