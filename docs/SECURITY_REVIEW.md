# SECURITY REVIEW

## Positive controls

- no backend custody
- no fake balances
- no fake live stats
- no fake addresses
- no mnemonic-based mandatory runtime path
- no seed storage in app flow
- manual signing only for future live actions
- env/secrets ignored by git rules
- database is cache only
- blockchain is source of truth
- JettonMinter admin transfer to Pool modeled and sandbox-verified
- test target clearly marked
- production target 8888 preserved
- TonConnect manifest configured for production URL

## Known remaining risks

- live proof not yet executed
- STON.fi listing not live-proven
- LP lock not live-proven
- indexer DB proof not live-proven
- manual signing mistakes can break sequence
- target misconfiguration can cause wrong investor impression if banners are ignored
- admin authority mistake can leave token authority-pending
