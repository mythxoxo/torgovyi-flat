# DEPLOYMENT

## GitHub readiness checklist

- `npm install`
- `npm run contracts:build`
- `npm run test:buy-flow`
- `npm run prepare:factory-tonconnect`
- `npm run prepare:token-flow-tonconnect -- --target 5`
- `npm run security:check`
- `npm run build`
- `git status` contains no secret env files

## Vercel env checklist

- `DATABASE_URL`
- `INDEXER_SHARED_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TONCONNECT_MANIFEST_URL`
- `NEXT_PUBLIC_FACTORY_ADDRESS`
- `NEXT_PUBLIC_LAUNCHPAD_TARGET_TON`
- `TONCENTER_API_KEY`
- `TONAPI_API_KEY`
