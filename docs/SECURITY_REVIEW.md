# SECURITY REVIEW

## Positive controls

- no backend custody
- no fake balances
- no fake live stats
- no fake addresses
- no mnemonic-based mandatory runtime path
- env/secrets ignored by git rules
- JettonMinter admin transfer to Pool modeled and sandbox-verified
- test target and production target separated in config

## Known remaining risks

- live proof not yet executed
- STON.fi listing not live-proven
- LP lock not live-proven
- indexer DB proof not live-proven
- manual signing mistakes can break sequence
- target misconfiguration can cause wrong investor impression if banners are ignored
- admin authority mistake can leave token authority-pending
