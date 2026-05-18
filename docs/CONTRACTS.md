# Contracts

## JettonFactory

Purpose:

- prepares token bundles
- normalizes creator tax config
- instantiates bonding curve, fee vault, vesting vault, and migrator
- compiles to ABI/BoC artifacts through `tact.config.json`
- Tact source: `contracts/factory/JettonFactory.tact`

## JettonMaster / JettonWallet

Purpose:

- fixed supply jetton reference
- mint disabled after creation
- wallet credit/debit helpers
- Tact source: `contracts/jetton/JettonMaster.tact`

## BondingCurve

Methods:

- on-chain messages: `Buy`, `Sell`, `Graduate`
- current compiled contract is buildable and ABI-addressable
- deterministic quote math still lives in the TypeScript reference engine until the full on-chain curve math is ported

Safety:

- no buy after graduation
- no sell after graduation
- no selling beyond circulating bonding supply
- no negative reserve
- Tact source: `contracts/bonding/BondingCurve.tact`

## FeeVault

Purpose:

- accumulates platform, creator, referral balances
- tracks creator-tax buyback and burn buckets
- stores creator and referral claim balances in on-chain maps
- supports creator and referral claim flows through `ClaimCreator` and `ClaimReferral`
- exposes getters for creator/referral claimables
- Tact source: `contracts/vaults/FeeVault.tact`

## PlatformVestingVault

Purpose:

- records graduation timestamp
- releases 50% immediately
- releases the remaining 50% linearly over 60 days
- computes claimable vesting on-chain with `getClaimable(nowTs)`
- tracks claimed allocation even before jetton transfer wiring is finished
- Tact source: `contracts/vaults/PlatformVestingVault.tact`

## LiquidityMigrator

Current state:

- Tact contract prepares migration, deducts 30 TON to platform, refunds 1 TON to creator, and records pending liquidity state
- final router call and LP lock/burn remain pending behind `FinalizeMigration`
- TypeScript `MockStonFiAdapter` is still implemented for the app simulation path
- Tact source: `contracts/migrator/LiquidityMigrator.tact`

Insertion points:

- `MigrateLiquidity` receiver -> real STON.fi router call
- `FinalizeMigration` receiver -> mark LP locked/burned after external router success

## Edge Cases

- duplicate graduation is blocked
- creator refund can remain claimable if wallet is unavailable
- failed real migration should set migration error state without reopening bonding trading
