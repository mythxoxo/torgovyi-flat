# Economics

## Core Parameters

- Total supply: `1,000,000,000`
- Bonding sale allocation: `80%`
- Liquidity / graduation reserve allocation: `19.5%`
- Platform allocation: `0.5%`
- Creation fee: `1 TON`
- Graduation fee: `30 TON`
- Base buy fee: `0.75%`
- Base sell fee: `0.75%`

## Fee Split

- `0.40%` to platform treasury
- `0.20%` to creator
- `0.15%` to referral
- If no valid referral exists, the referral share also routes to platform treasury

## Creator Tax Modes

- Mode A `normal`: `0%`
- Mode B `burn`: `1%`, all burned
- Mode C `buyback_burn`: `1.5%`, `70%` buyback / `30%` burn
- Mode D `custom`: `0%`, `0.5%`, `1%`, `1.5%`, or `2%` with split summing to `100%`

## Platform Supply Vesting

- Total platform allocation: `0.5%` of total supply
- `50%` unlocks at graduation
- `50%` vests linearly over `60 days`

## Linear Curve

- Initial price: `0.00000002 TON`
- Slope: `0.00000000000000011524390243902439 TON`
- Reserve target at graduation: `52.8780487804878 TON`

The curve is chosen so that the final curve price is close to the expected STON.fi pool ratio after:

- deducting `30 TON` graduation fee
- refunding `1 TON` to the creator
- pairing remaining reserve with the reserved liquidity token allocation

## Worked Example

For a `1 TON` buy in normal mode:

- base fee: `0.0075 TON`
- creator tax: `0 TON`
- net into reserve: `0.9925 TON`
- fee split:
  - `0.004 TON` platform
  - `0.002 TON` creator
  - `0.0015 TON` referral or treasury fallback

## Risks

- Linear curves are simple but can still misprice migration if parameters drift.
- Large sells can create sharp reserve drawdowns even with deterministic math.
- Mock migration means post-graduation liquidity is not truly on-chain until the real adapter is wired.
