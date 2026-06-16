# Codex usage plan

TONK.MEM will use Codex for open-source maintenance workflows.

## Pull request review

Codex will help review changes touching:

- TonConnect transaction payloads
- no-custody transaction flow
- token launch configuration
- token authority verification
- indexer/database logic
- public API routes

## Issue triage

Codex will help reproduce bugs, identify affected modules, and propose minimal patches.

## Security maintenance

Codex will help check:

- committed secrets
- unsafe wallet assumptions
- authority-transfer mistakes
- incorrect mainnet/testnet configuration
- dependency risks
- unsafe API behavior

## Release workflow

Codex will help prepare:

- release checklists
- changelog drafts
- migration notes
- verification steps
- regression tests

## Human review

Codex will not auto-merge code. Maintainers review all security-sensitive changes before release.
