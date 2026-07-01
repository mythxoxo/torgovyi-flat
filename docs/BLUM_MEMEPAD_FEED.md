# Blum Memepad feed integration

This project now has a separate external source for Blum Memepad tokens.

## What was confirmed

- Blum Memepad is a TON memecoin launchpad.
- Tokens use a bonding-curve phase first.
- After the bonding cap is reached, liquidity is moved to STON.fi V2.
- The public third-party `@fiscaldev/blum-sdk` package is useful for interacting with already-known Blum Jetton contracts, but it does not expose a token-discovery API by itself.

## Runtime endpoint

```txt
GET /api/external/blum
GET /api/external/blum?limit=12
GET /api/external/blum?addresses=EQ...,UQ...
```

The endpoint returns:

```ts
{
  source: "configured_feed" | "address_list" | "not_configured";
  configured: boolean;
  scannedAt: string;
  tokens: TokenRecord[];
  warning?: string;
}
```

## Environment variables

### BLUM_MEMEPAD_FEED_URL

Optional JSON feed URL. Use this if you have a reliable public or private Blum Memepad feed source.

The parser accepts common shapes:

```json
[{ "name": "...", "symbol": "...", "address": "EQ..." }]
```

or:

```json
{ "tokens": [{ "name": "...", "symbol": "...", "jetton_address": "EQ..." }] }
```

Supported field aliases include:

- `address`, `contractAddress`, `jettonAddress`, `jetton_address`, `jettonMaster`, `jetton_master`, `master`, `pool_address`
- `name`, `title`, `tokenName`, `token_name`
- `ticker`, `symbol`, `tokenSymbol`, `token_symbol`
- `createdAt`, `created_at`, `launchedAt`, `launched_at`
- `collectedTon`, `collected_ton`, `reserveTon`, `reserve_ton`
- `progress`, `bondingProgress`, `bonding_progress`
- `isListed`, `is_listed`, `listed`, `dex`, `migrated`

### BLUM_MEMEPAD_JETTONS

Optional comma-separated fallback list of known Blum Memepad Jetton masters:

```txt
BLUM_MEMEPAD_JETTONS=EQ...,UQ...
```

This is not live discovery. It is a safe fallback for manually tracked candidates.

## UI

The home page now shows a separate `Blum Memepad` section under the native TONK.MEM launchpad feed.

External Blum cards do not route to `/token/:id`. They open Tonviewer or the URL supplied by the feed, so they cannot break the native token page routing.

## Important limitation

No official public Blum Memepad discovery SDK/API was found. The third-party SDK reads and trades known contracts; it does not enumerate newly launched tokens.

For fully automatic discovery, use one of these production sources:

1. A vetted JSON feed URL from an allowed/public Blum data source.
2. A backend indexer that detects Blum-specific Jetton contracts on TON by factory/source contract and `get_bcl_data`/bonding-curve methods.
3. A maintained internal allowlist via `BLUM_MEMEPAD_JETTONS` until the indexer is ready.
