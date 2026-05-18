# RISK REGISTER

| Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---:|---|---|
| Live proof not executed | High | Medium | Manual signing + funded wallets + verify scripts | Open |
| STON.fi listing not live-proven | Medium | Medium | Keep status pending, no fake listed flag | Open |
| LP lock not live-proven | Medium | Medium | Do not claim live lock until proof exists | Open |
| Indexer DB not live-proven | Medium | Medium | Use chain verify + `index:once` after live txs | Open |
| Manual signing errors | High | Medium | TonConnect prepare scripts + runbook | Open |
| Target misconfiguration | High | Low | Test-mode banner + return-to-8888 doc | Controlled |
| Owner/admin authority mistake | High | Medium | verify `adminAddress == Pool` before live | Controlled |
| UI misleading users | High | Low | honest status banners and docs | Controlled |
| Fake data regression | High | Low | security check + no fake stats route | Controlled |
