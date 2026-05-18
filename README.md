# TON Meme Launchpad MVP

Telegram Mini App MVP for launching meme tokens on TON with a fixed-supply jetton, bonding curve trading, graduation into STON.fi, referral economics, creator tax presets, and a mobile-first interface.

This repository is structured as a monorepo:

- `apps/web` - Next.js Telegram Mini App
- `apps/api` - Express API, indexer mock, and launchpad state engine
- `apps/bot` - Telegram bot with Mini App deep links and referral flow
- `packages/shared` - tokenomics, bonding curve, types, fixtures
- `packages/sdk` - frontend/backend helper utilities
- `packages/config` - shared env helpers
- `contracts` - Tact smart contracts plus generated build artifacts
- `scripts` - simulation, testnet deployment scaffold, demo seed
- `docs` - architecture, economics, contracts, API, deployment, risks
- `tests` - contract math, API, and end-to-end flow coverage
- `legacy/p2p-spreadbot` - isolated files from the previous unrelated Mini App

## Quick Start

```bash
npm install
copy .env.example .env
npm run contracts:build
npm run seed
npm run dev
```

Open:

- web: `http://localhost:3000`
- api: `http://localhost:3001/health`

## Current Reality

- real `.tact` source files now exist under `contracts/`
- `npm run contracts:build` emits `.boc`, `.fc`, `.abi`, `.pkg`, TS wrappers, and compilation reports under `contracts/build/`
- TonConnect is wired for real wallet connection plus ABI-compatible create/buy payload construction
- sell signing is still intentionally simulated until the deployed jetton wallet transfer path is wired
- claim flows exist in backend and UI
- image uploads are stored through a storage adapter (`local` or `s3`) instead of being persisted inline in snapshot JSON
- PostgreSQL snapshot storage is implemented through `pg`
