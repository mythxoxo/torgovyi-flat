# Deployment

## Local

1. `npm install`
2. `copy .env.example .env`
3. `npm run contracts:build`
4. `npm run seed`
5. `npm run dev`

## Build

- `npm run contracts:check`
- `npm run contracts:build`
- `npm run build`
- `npm run test`
- `npm run simulate`

## Testnet Notes

- set `TON_NETWORK=testnet`
- provide `TONCENTER_API_KEY`
- provide treasury and router addresses
- set `NEXT_PUBLIC_FACTORY_ADDRESS` after JettonFactory deployment
- generated contract artifacts live under `contracts/build/`
- replace `MockStonFiAdapter` with a real STON.fi integration
- set `DATABASE_URL` to use the implemented PostgreSQL snapshot repository
- set `UPLOAD_STORAGE=s3` plus S3 credentials if images should not stay on local disk

## Telegram

- set bot commands in `@BotFather`
- point Mini App URL to the deployed `apps/web` when a public `https://` URL is available
- run bot with `TELEGRAM_BOT_TOKEN`

## Storage

- local MVP defaults to file snapshots
- production path should use PostgreSQL and an indexer worker
