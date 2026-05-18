# Bonding curve

Status: VERIFIED only at formula/document level in this pass.

## Formula

MVP uses a fixed-rate sale formula:

- `1 TON = 1,000,000 sale tokens`
- token decimals are assumed at integration layer
- contract computes:
  - `acceptedTon = min(msg.value, targetTon - collectedTon)`
  - `tokensOut = floor(acceptedTon / 1 TON) * 1,000,000`

## Safety properties

- deterministic
- no division by zero
- bounded by remaining target
- over-target final buy is capped by acceptedTon
- buys after graduation are blocked

## Allocation

Current pass does **not** verify final production tokenomics split on-chain.

What is currently compile-defined:

- target ton: `8888 TON`
- minimum buy: `0.05 TON`
- fixed output rate for accepted TON

## Examples

- buy `1 TON` -> `1,000,000` tokens
- buy `0.05 TON` -> `0` tokens with current coarse integer math if using exact contract implementation; this is a known risk and must be fixed before production mint accounting
- final buy above target -> acceptedTon is capped to remaining target

## Important note

This curve is intentionally simple for second-pass hardening.
It is not a verified pump.fun-style curve.
