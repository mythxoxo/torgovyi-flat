# MAINNET LAUNCH PLAN

## Phase 1: test target 5 TON

1. `npm run prepare:factory-tonconnect`
2. manual Factory deploy
3. `npm run verify:factory -- --address <factory>`
4. `npm run prepare:token-flow-tonconnect -- --target 5`
5. manual JettonMinter/Pool/LPLock deploy
6. `npm run prepare:change-owner-tonconnect -- --jetton <jetton> --pool <pool>`
7. manual ChangeOwner signing
8. `npm run verify:token-flow -- --factory <factory> --pool <pool> --jetton <jetton>`
9. `npm run prepare:register-pool-tonconnect -- --factory <factory> --pool <pool> --jetton <jetton> --creator <creator>`
10. manual RegisterPool signing
11. `npm run prepare:buy-tonconnect -- --pool <pool> --amount 0.05`
12. manual buy signing
13. `npm run verify:buyer-jettons -- --jetton <jetton> --buyer <buyer>`
14. `npm run index:once -- --execute`

## Phase 2: return to 8888

1. set target envs to `8888`
2. rerun payload prep
3. rerun build/security/contracts checks
4. repeat manual proof on production target before public launch
