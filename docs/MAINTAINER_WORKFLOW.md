# Maintainer workflow

This document tracks repository maintenance work for TONK.MEM.

## Pull requests

- Keep `main` protected.
- Use pull requests for repository metadata, documentation, CI, and code changes.
- Keep changes small and reviewable.

## CI

The `ci` workflow runs on pushes and pull requests targeting `main`.

Current checks:

- `npm ci`
- `npm run contracts:build`
- `npm run build`
- `npm run security:check`

## Releases

Public releases should be tagged and documented honestly as MVP / pre-mainnet until live mainnet deploy and buy proofs are recorded.
