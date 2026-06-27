# Token price visibility fix audit

## Root causes

1. Launchpad token cards did not render a price row.
2. The buy/sell box used only active bonding quotes for the current price, so non-bonding tokens showed an empty price.
3. External market API returned an error-shaped response when the live source was unavailable, so the External tab became empty instead of showing fallback tokens.

## Applied fixes

- `src/components/token-card.tsx` now computes a visible fallback price and renders a price row.
- `src/components/buy-sell-box.tsx` now computes `visibleCurrentPrice` even when active bonding quote is unavailable.
- `src/app/api/external-tokens/route.ts` now returns fallback external tokens with `ok: true` when the live source is empty or unavailable.

## Remaining backend cleanup

The API row mapper still should be cleaned locally so `currentPriceTon` is calculated server-side instead of relying only on UI fallback.

Recommended formula:

- If `sold_tokens > 0`, use the bonding curve spot price for the sold supply.
- If no sold tokens exist, use the initial curve price.
- Market cap should be `currentPriceTon * 1_000_000_000`.
- Remaining bonding supply should be `800_000_000 - sold_tokens`.

Direct update of the large API file was blocked by the GitHub connector during this pass, so this backend cleanup is listed as a local follow-up.
