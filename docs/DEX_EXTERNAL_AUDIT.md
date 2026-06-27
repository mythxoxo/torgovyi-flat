# External DEX audit and integration notes

## Current bonding fee

The existing bonding-curve trade fee remains unchanged in this pass.

- `BASE_TRADE_FEE_RATE = 0.0075` = 0.75%
- `PLATFORM_FEE_RATE = 0.004` = 0.40%
- `CREATOR_FEE_RATE = 0.002` = 0.20%
- `REFERRAL_FEE_RATE = 0.0015` = 0.15%
- `MAX_CREATOR_TAX_RATE = 0.02` = 2%

The bonding quote functions use the same `calculateTradeFees()` path for buy and sell.

## External DEX fee decision

External DEX swaps are separate from bonding trades.

Recommended starting platform fee:

- `DEX_PLATFORM_FEE_BPS = 25` = 0.25%

Reason: external DEX users already pay DEX spread/fee, slippage, and network fees. Starting at 0.25% is less aggressive than 0.75% bonding fees and is safer for conversion.

## Token price display audit

Root causes found:

1. Launchpad token cards did not render a price row.
2. Trade box used only active bonding quotes for current price, so non-bonding tokens showed an empty price.
3. External market API returned an error-shaped response when the live source was unavailable, so the External tab became empty instead of showing fallback tokens.

Applied fixes in this branch:

- Token cards compute a visible fallback price and render a price row.
- Buy/sell box computes a visible current price even when active bonding quote is unavailable.
- External token API returns fallback tokens with `ok: true` when the live source is empty or unavailable.

Remaining backend cleanup:

- Move the same price calculation into API mapping so server responses stop returning zero for `currentPriceTon`.
- Direct update of the large API file was blocked during this pass by the GitHub connector, so local agent should apply the same formula server-side and run build.

## DeDust state

DeDust is the preferred launchpad DEX path.

Current repo state before this pass had DeDust liquidity/listing helper code, but not a complete universal swap integration. The new code adds DeDust quote/swap status modules and explicit statuses:

- `sdk_missing`
- `payload_unavailable`
- `route_not_found`
- `liquidity_not_found`
- `proxy_required_for_sell_fee`

No fake DeDust swap payload is generated.

Buy path strategy:

- TON -> Jetton quote/check first.
- Fee can be split from TON input once official DeDust swap payload is wired.

Sell path strategy:

- Jetton -> TON with platform fee should use a proxy or official fee/referral mechanism.
- Until that exists, sell returns `proxy_required_for_sell_fee` instead of fake success.

## STON.fi state

STON.fi packages are already present and are treated as secondary.

The implementation uses STON.fi quote/swap modules with API-first behavior. STON.fi can become the second manual choice after DeDust.

## UI rule

Manual selector only:

- DeDust
- STON.fi

If both have route, user chooses manually. No auto best route in this pass.

Fee rows must show:

- Expected receive
- Minimum receive
- DEX fee
- Platform fee
- Slippage/price impact
- Route status

## Remaining hard blockers

- DeDust official SDK export mapping must be verified locally after installing `@dedust/sdk`.
- DeDust final buy/sell payloads should not be enabled until SDK payload building is confirmed.
- DeDust sell fee likely needs a PlatformSwapProxy contract or official referral mechanism.
