# PRODUCTION INFRASTRUCTURE

## Vercel

- frontend
- TonConnect UI
- static/public pages
- no frequent cron on Hobby
- public preview deploy runs without cron

## Manual public preview indexing

- `npm run index:once`
- `npm run index:dry-run`

## Future VPS worker / Pro setup

- indexer worker
- graduation watcher
- DeDust watcher
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
