# Contributing

Thanks for helping improve TONS of GRAM.

## Development

```bash
npm install
npm run security:check
npm run build
```

## Pull requests

Before opening a PR:

- explain what changed
- include testing notes
- do not commit secrets
- do not introduce backend custody of user funds
- keep TonConnect/manual signing path intact
- keep mainnet/testnet behavior explicit

## Security-sensitive changes

Changes touching transaction payloads, wallet flow, token authority, database access, or deployment configuration require extra review.

## Maintainer workflow

- Open changes through pull requests
- Keep `main` protected
- Prefer small reviewable patches
- Keep release notes updated in `CHANGELOG.md`
