# MANUAL TEST FLOW

## Goal

Manual no-custody mainnet test flow using wallet signing.

## Sequence

1. `npm run prepare:factory-tonconnect`
2. sign factory deployment manually in wallet
3. verify factory getters
4. `npm run prepare:token-flow-tonconnect -- --target 5`
5. sign JettonMinter / Pool / LPLock deployment manually
6. sign ChangeOwner JettonMinter -> Pool manually
7. verify Jetton admin == Pool
8. sign RegisterPool manually
9. verify Factory registry
10. `npm run prepare:buy-tonconnect -- --pool <pool> --amount 0.05`
11. sign buy manually
12. verify pool getters and buyer jetton balance
13. `npm run index:once -- --execute`
14. verify DB row update
