# TECHNICAL ARCHITECTURE

## Frontend

- Next.js app
- Telegram/TonConnect-compatible UX
- manual no-custody signing flow

## TonConnect manual flow

- prepare scripts generate TonConnect-compatible JSON payloads
- user signs manually in wallet
- verify scripts read chain state afterward

## Factory registry fallback

- Factory currently acts as registry/discovery source
- Pool/Jetton pair is registered explicitly
- indexer discovers pools through Factory registry

## JettonMinter

- official-style Tact Jetton base integrated
- owner/admin must be transferred to Pool before token is considered live

## Pool

- receives TON buys
- tracks collected TON and sold token amount on chain
- mints/sends Jettons via JettonMinter
- targetTon is runtime-configurable

## LPLock

- contract scaffolded and compiled
- live LP lock proof still pending

## Indexer

- reads Factory registry and Pool getters
- database is cache only
- blockchain is source of truth

## DeDust listing fallback

- scaffold preserved
- no fake listed state
- live listing proof still pending
