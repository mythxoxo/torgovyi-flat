# FAQ

## Is it live?
Partially. The buy path and buyer jetton delivery were proven earlier on mainnet for the corrected launch flow. Listing/liquidity and claim payout are not live-proven yet.

## Is it custodial?
No. The product remains manual-sign / no-custody.

## What is verified?
Contracts build, contract verification, sandbox buy/mint loop, factory registry tests, build, security check, indexer dry-run, and the earlier corrected mainnet buy proof.

## What is not fully verified?
External DeDust liquidity creation, LP lock proof, claim payout execution, and full indexer classification for all transaction kinds.

## What happens after token graduation?
A listing intent can be created and tracked. DeDust verification paths now report concrete external-liquidity failures instead of missing-intent placeholders.

## Can users lose funds?
Yes. This is a high-risk meme-token system. Manual signing and incomplete external liquidity proof still create operational risk.

## What prevents fake balances?
Blockchain state is the source of truth, indexer is cache only, and product surfaces were cleaned up to avoid fake success or fake live numbers.
