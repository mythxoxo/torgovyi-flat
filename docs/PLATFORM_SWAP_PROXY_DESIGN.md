# PlatformSwapProxy Design

## Goal

Support DeDust sell flow with platform fee taken from TON output, without faking payloads and without backend custody of user funds.

## Flow

1. User signs jetton transfer from their jetton wallet to `PlatformSwapProxy`.
2. Proxy validates paused flag, fee config, and swap parameters.
3. Proxy forwards swap call to DeDust Jetton Vault.
4. DeDust executes swap and returns TON to proxy.
5. Proxy deducts platform fee in TON.
6. Proxy sends fee to treasury.
7. Proxy sends net TON to the original user recipient.

## Failure / refund path

- If swap forwarding fails before vault accepts the transfer, proxy must reject and keep no silent state.
- If TON output is not received as expected, proxy must expose an admin-auditable failure event/state and allow explicit refund path.
- Proxy must never silently retain user swap funds as arbitrary custody balance.

## Ownership / upgrades

- owner/admin can update treasury, fee bps, and pause flag
- fee bps must be capped by contract constant
- owner cannot seize arbitrary user swap flow proceeds beyond explicit dust recovery rules

## Admin limitations

- admin must not be able to redirect active swap output to self
- admin must not mutate recipient after user-signed transfer
- admin must not exceed max fee cap

## Gas assumptions

- user covers transfer + swap gas via signed message
- proxy keeps only minimal dust needed for in-flight execution

## Replay protections

- unique queryId / swap request correlation
- reject duplicated in-flight execution ids where possible

## Current implementation status

- design documented
- live proxy contract not implemented in this pass
- sell stays behind `proxy_required_for_sell_fee` until safe proxy path is implemented and verified
