# TECHNICAL ARCHITECTURE

## Frontend

- Next.js app
- Telegram/TonConnect-compatible UX
- manual no-custody signing flow

## TonConnect manual flow

- prepare scripts generate TonConnect-compatible JSON payloads
- user signs manually in wallet
- verify scripts read chain state afterward

## Factory registry / orchestration model

- Factory acts as authoritative registry and validation state machine
- Pool/Jetton pair is registered explicitly and guarded against duplicates
- backend executor can still orchestrate deploy steps where direct on-chain deployment is not practical
- UI/API must not present this as a fully autonomous deploy factory

## JettonMinter

- official-style Tact Jetton base integrated
- owner/admin must be transferred to Pool before token is considered live

## Pool

- receives TON buys
- tracks collected TON and sold token amount on chain
- mints/sends Jettons via JettonMinter
- targetTon is runtime-configurable

## LPLock

- contract compiled and available
- live LP lock verification still depends on real listing execution evidence

## Indexer

- reads Factory registry and Pool getters
- stores minimal token/trade-like rows
- database is cache only
- blockchain is source of truth

## DeDust listing

- listing intent is persisted
- payload preparation is manual-sign only
- verification reports concrete external-liquidity reasons when the external pool/LP is absent
