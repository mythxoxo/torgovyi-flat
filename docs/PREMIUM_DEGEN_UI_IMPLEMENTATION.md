# Premium Degen UI Implementation

## Scope

This implementation applies the concept-3 direction as a premium degen UI layer for the existing TON launchpad product.

## Architecture invariants

Do not change:

- `src/app/api/*`
- `src/lib/dex/*`
- `src/lib/external-tokens/*`
- `src/lib/server/*`
- `contracts/*`
- `indexer/*`
- TonConnect wallet behavior
- DEX quote/swap behavior
- live metrics enrichment
- token names/images/data sources

## Real product routes covered

Current navigation routes:

- `/` Home / Launch landing
- `/terminal` Live launch feed
- `/search` Token search
- `/markets` Launchpad + External markets
- `/create` Create token flow
- `/my-tokens` Profile / wallet assets
- `/token/[id]` Launchpad token and External token details

## Design direction

Use premium degen, not cheap casino neon:

- dark premium base
- TON blue for trust and tech
- magenta/pink for primary action accents
- green only for positive/live metrics
- clean glass panels
- clear hierarchy
- no fake financial promises
- no fake balances or fake transactions

## Implementation approach

- Add `src/app/premium-degen.css` as a presentation-only skin.
- Import it from `src/app/layout.tsx` after `globals.css`.
- Wrap desktop/mobile shells with `.premium-degen`.
- Use reusable classes: `pd-panel`, `pd-card`, `pd-chip`, `pd-btn-primary`, `pd-btn-secondary`, `pd-stat`, `pd-empty`.
- Update route headers for Home, Markets, Create, Profile.
- Existing Terminal/Search/cards/panels inherit the skin through shared glass/input/button classes.

## Verification checklist

- Build must pass.
- Security check must pass.
- No backend/API/DEX/server/contracts/indexer files should be changed.
- Home must load with premium degen hero.
- Markets must load with Launchpad and External tabs.
- Create page must preserve `CreateTokenForm` behavior.
- Profile must preserve `WalletAssetsPanel` behavior.
- Terminal and Search must preserve existing data fetch and filters.
