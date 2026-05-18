# Mainnet dust test

## A) .env.local setup

Copy `.env.local.example` to `.env.local` and fill only locally.
Do not commit it.

## B) Commands in order

```bash
npm run contracts:build
npm run verify:contracts
npm run security:check
npm run build

npm run deploy:factory -- --network mainnet --dry-run
npm run deploy:factory -- --network mainnet --execute

# Save factory address, then export/set NEXT_PUBLIC_FACTORY_ADDRESS
npm run deploy:token-flow -- --network mainnet --dry-run
npm run deploy:token-flow -- --network mainnet --execute

# Save pool + jetton master + lp lock + ChangeOwner tx hash manually from wallet/explorer
npm run test:buy-flow:live -- --pool <pool> --amount <small_amount> --dry-run
npm run test:buy-flow:live -- --pool <pool> --amount <small_amount> --execute

npm run check:buyer-jettons -- <jettonMaster> <buyerAddress>
npm run index:once -- --dry-run
npm run index:once -- --execute
```

## C) What each command should print

- `deploy:factory --dry-run`
  - factory address
  - owner address
  - no tx sent
- `deploy:factory --execute`
  - same derived address
  - wallet/explorer must show actual deployment tx hash
- `deploy:token-flow --dry-run`
  - creator
  - lpLock
  - jettonMaster
  - pool
  - required flow sequence
- `deploy:token-flow --execute`
  - same addresses
  - execute sequence manually if script does not broadcast all steps yet
- `test:buy-flow:live --dry-run`
  - pool
  - amountTon
  - collectedBefore
  - soldBefore
  - jettonMaster
- `test:buy-flow:live --execute`
  - collectedAfter
  - soldAfter
  - wallet tx must be saved manually
- `check:buyer-jettons`
  - buyer jetton wallet address
  - balance
  - owner
  - master
- `index:once --execute`
  - processed
  - poolCount
  - note

## D) Save these artifacts

- Factory deployment tx hash
- Factory address
- JettonMinter address
- Pool address
- LPLock address
- ChangeOwner tx hash
- RegisterPool tx hash
- Buy tx hash
- Buyer jetton wallet address
- Buyer jetton balance output
- Indexer execution output
- DB row snapshot for token after buy

## E) Verify JettonMinter owner == Pool

Use chain read of `get_jetton_data()` and compare `adminAddress` with Pool address.
If they differ:
- do not register token as live
- do not allow live buy
- status must remain authority-pending

## F) Verify buyer received Jettons

Run:

```bash
npm run check:buyer-jettons -- <jettonMaster> <buyerAddress>
```

Expected:
- non-zero `balance`
- `master` equals your JettonMinter
- `owner` equals buyer address

## G) Verify indexer wrote DB row

1. Run `npm run index:once -- --execute`
2. Check token row by `pool_address`
3. Confirm fields changed:
   - `collected_ton`
   - `sold_tokens`
   - `jetton_address`
   - `lp_lock_address`
   - `status`

## H) Emergency rollback plan

If deploy partially succeeded:
- If Factory deployed but token flow not completed:
  - do not set `NEXT_PUBLIC_FACTORY_ADDRESS` publicly until ready
- If JettonMinter deployed but owner not transferred to Pool:
  - do not register pair in Factory
  - do not mark live
- If Pool deployed but RegisterPool failed:
  - keep token undiscovered by app/indexer
- If buy attempted before authority verified:
  - stop immediately
  - verify `get_jetton_data().adminAddress`
  - verify buyer wallet balance before further actions
- Never patch status manually in DB to pretend token is live.
