# Security Policy

## Reporting vulnerabilities

Please do not open public issues for security vulnerabilities.

Report privately by email: daniil3sok@gmail.com

## Scope

In scope:

- secret leakage
- unsafe transaction payload generation
- custody bypass
- token authority mistakes
- database exposure
- unsafe API routes
- incorrect mainnet/testnet configuration

Out of scope:

- spam
- social engineering
- attacks against third-party systems without permission

## Project safety rules

- no private keys in repository
- no mnemonics in repository
- no backend custody of user funds
- users sign TON transactions manually through wallet
- production config must not silently fall back to test mode

## Maintainer response

Security-sensitive changes require human maintainer review before merge. Issues that may expose secrets, wallet assumptions, transaction payload bugs, or unsafe authority transitions should be handled privately first.
