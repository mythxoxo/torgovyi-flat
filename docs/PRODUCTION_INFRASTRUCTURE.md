# PRODUCTION INFRASTRUCTURE

## Vercel

- frontend
- TonConnect UI
- static/public pages
- no frequent cron on Hobby
- investor/demo deploy runs without cron

## Manual investor/demo indexing

- `npm run index:once`
- `npm run index:dry-run`

## Future VPS worker / Pro setup

- indexer worker
- graduation watcher
- STON.fi watcher
- LP lock watcher
- logs
- systemd service or equivalent worker runtime

## DB

- Supabase / Neon Postgres
- cache only
- blockchain is source of truth

## RPC

- TONCENTER
- TONAPI
