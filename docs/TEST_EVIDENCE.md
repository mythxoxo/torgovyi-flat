# TEST EVIDENCE

## Verified commands

### `npm run contracts:build`
- contracts compile successfully

### `npm run verify:contracts`
- output: `{ "ok": true }`

### `npm run test:buy-flow`
- output includes:
  - `ok: true`
  - `targetTon: "5000000000"`
  - `buyerJettonBalance: "2000000"`

### `npm run prepare:factory-tonconnect`
- outputs derived Factory address and owner

### `npm run prepare:token-flow-tonconnect -- --target 5`
- outputs target `5`, `testMode: true`, derived Jetton/Pool/LPLock

### `npm run prepare:change-owner-tonconnect ...`
- outputs TonConnect payload with valid destination/value/payload

### `npm run prepare:register-pool-tonconnect ...`
- outputs TonConnect payload with valid destination/value/payload

### `npm run prepare:buy-tonconnect ...`
- outputs TonConnect draft with valid destination/value/payload

### `npm run security:check`
- output: `{ "ok": true }`

### `npm run build`
- production build passes
