# Contracts

## Build

```bash
npm run contracts:build
npm run verify:contracts
```

## Artifacts

Generated wrappers and ABI files live under:

- `build/launchpad-factory`
- `build/launchpad-pool`
- `build/lp-lock`

## Current verified scope

VERIFIED in this pass:

- Tact compile for `LaunchpadFactory`, `LaunchpadPool`, `LPLock`
- generated wrappers and ABI files exist
- required getters exist in ABI
- frontend payload builder can be aligned to generated ABI fields
- pool over-target cap logic exists in compiled contract
- post-graduation/listed buy blocking exists in compiled contract

NOT VERIFIED in this pass:

- real Jetton mint/send delivery to buyers
- real Factory deployment of Jetton + Pool child contracts
- real LP token receive path from STON.fi into `LPLock`
- end-to-end on-chain child deployment and event parsing

## Read state

```bash
npm run read:pool -- <POOL_ADDRESS>
```

## Dry-run create payload

```bash
EXAMPLE_CREATOR_ADDRESS=<ADDR> NEXT_PUBLIC_FACTORY_ADDRESS=<ADDR> npm run deploy:token-example
```
