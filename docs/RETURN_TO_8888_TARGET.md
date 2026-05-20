# RETURN TO 8888 TARGET

For manual tests you may set:

```env
LAUNCHPAD_TARGET_TON=5
NEXT_PUBLIC_LAUNCHPAD_TARGET_TON=5
```

Before production:

```env
LAUNCHPAD_TARGET_TON=8888
NEXT_PUBLIC_LAUNCHPAD_TARGET_TON=8888
```

Verification steps:

1. run `npm run prepare:token-flow-tonconnect -- --target 8888`
2. confirm output shows `targetTon: 8888`
3. run `npm run test:buy-flow`
4. run `npm run build`
5. confirm public-facing docs no longer describe active test target deployment
