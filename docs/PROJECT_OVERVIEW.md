# PROJECT OVERVIEW

TONK.MEM is a security-first TON meme token launchpad designed for Telegram-native distribution and manual no-custody wallet flow.

## Why TON / Telegram

- Telegram distribution is native to the product surface.
- TON wallet UX supports in-app/manual signing flows.
- DeDust is the natural post-graduation liquidity venue.

## What the product does

- prepares launch contracts and wallet flows for meme token creation
- runs a bonding-based sale phase
- tracks pool state on chain
- prepares graduation path toward DeDust

## How bonding works

- launch target is configurable for testing and production
- test target: `5 TON`
- production target: `8888 TON`
- blockchain is the source of truth for collected TON / sold tokens

## No-custody model

- manual signing through TonConnect / Tonkeeper
- no backend custody of user funds
- no fake balances / no fake addresses

## Already verified

- contracts build
- contract verification
- sandbox buy/mint loop
- security check
- build
- manual TonConnect payload preparation

## Pending live proof

- mainnet deploy
- mainnet buy
- buyer jetton balance on chain
- DeDust live proof

## Near-term launch steps

1. manual Factory deploy
2. token-flow deploy at 5 TON target
3. manual buy proof
4. indexer proof
5. return target to 8888 TON
