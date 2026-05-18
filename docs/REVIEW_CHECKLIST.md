# REVIEW CHECKLIST

Run:

```bash
npm install
npm run contracts:build
npm run verify:contracts
npm run test:buy-flow
npm run prepare:factory-tonconnect
npm run prepare:token-flow-tonconnect -- --target 5
npm run security:check
npm run build
```

Expected:
- install succeeds
- contracts compile
- verify scripts pass
- sandbox buy/mint loop returns non-zero buyer Jetton balance
- TonConnect payload prep returns structured JSON
- security check passes
- production build passes
