# Architecture

## Components

- `apps/web`: Next.js Telegram Mini App with Home, Create, Token, Referrals, and My Tokens pages.
- `apps/api`: Express service that stores token metadata, indexes trades, serves token feeds, and simulates bonding-curve execution.
- `apps/api` also serves upload storage and claim flows.
- `apps/bot`: Telegram bot with `/start`, `/create`, `/trending`, and `/ref` commands plus Mini App deep links.
- `packages/shared`: Single source of truth for economics, fee math, curve math, demo fixtures, and domain types.
- `contracts`: TON-oriented reference modules for factory, jetton, bonding curve, vaults, and migration.
- `scripts`: simulation, seed generation, and testnet deployment scaffold.

## Create Flow

1. User opens the Mini App from Telegram.
2. Wallet connects via TonConnect or the local demo wallet fallback.
3. User fills token metadata and creator tax mode.
4. Frontend sends metadata to `POST /tokens`.
5. API stores token metadata, creation fee escrow state, creator tax config, and mock contract addresses.
6. Token appears in `GET /tokens?filter=new`.

## Buy / Sell Flow

1. Token page loads bonding state from `GET /tokens/:id`.
2. UI computes local quote from shared bonding-curve math for instant feedback.
3. User confirms buy or sell.
4. Frontend sends trade request to `POST /tokens/:id/buy` or `POST /tokens/:id/sell`.
5. API re-runs the quote server-side, applies fees, updates reserve, balances, holders, and live trades.
6. Referral share routes to referral balance when valid; otherwise it falls back to treasury.
7. Claimable creator, referral, and refund balances can be withdrawn through `POST /claim`.

## Graduation Flow

1. Bonding reserve and sold supply move with every trade.
2. When the graduation condition is reached, bonding trading stops.
3. `30 TON` is reserved as the graduation fee.
4. Creator refund becomes claimable for the original `1 TON` creation fee.
5. Liquidity amounts are prepared from reserve plus the reserved liquidity token allocation.
6. Platform vesting starts: 50% immediate unlock, 50% linear over 60 days.

## STON.fi Migration

- Current repository includes a `MockStonFiAdapter` and `LiquidityMigrator`.
- The architecture already isolates the exact handoff:
  - reserve and liquidity token amounts are calculated in shared math
  - `LiquidityMigrator` receives the token state and prepared balances
  - a real adapter must replace mock `addLiquidity` and `lockOrBurnLp` calls
- The API does not pretend real LP was minted when the mock adapter is active.

## Media Storage

- token images are uploaded through `POST /uploads`
- local development stores files in `data/uploads`
- production can switch to S3 through env configuration
