# Vercel deploy

## Safety rules

- Do not commit `.env.local`, `.env.production`, `.env.production.local`, or any secret-bearing env file.
- Use Vercel project environment variables for production.
- Keep `DEPLOYER_MNEMONIC` and `LISTING_WALLET_MNEMONIC` out of Vercel unless you explicitly need server-side execution.

## Required Vercel envs for read-only app/indexer mode

- `DATABASE_URL`
- `INDEXER_SHARED_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TONCONNECT_MANIFEST_URL`
- `NEXT_PUBLIC_FACTORY_ADDRESS`
- `TONCENTER_API_KEY`
- `TONAPI_API_KEY`

## Deploy order

1. Deploy Factory locally first.
2. Run token flow locally.
3. Confirm authority transfer locally/by explorer.
4. Set `NEXT_PUBLIC_FACTORY_ADDRESS` in Vercel.
5. Deploy app.
6. Run `npm run index:once -- --execute` locally or trigger `/api/index` with shared secret.
