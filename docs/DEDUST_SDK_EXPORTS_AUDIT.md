# DeDust SDK Exports Audit

Inspected locally on branch `feature/dedust-real-swap-proxy` via:

```bash
node - <<'NODE'
import('@dedust/sdk').then((sdk) => {
 console.log(Object.keys(sdk).sort())
})
NODE
```

Observed exports:

- Asset
- AssetError
- AssetType
- BLANK_CODE
- ContractType
- DeDustClient
- Factory
- JettonRoot
- JettonWallet
- LiquidityDeposit
- MAINNET_API_URL
- MAINNET_FACTORY_ADDR
- Pool
- PoolType
- ReadinessStatus
- Vault
- VaultJetton
- VaultNative
- createProof
- createStateInit
- createVaultProof
- verifyVaultAddress
- wrapTonConnect

Confirmed relevant concepts exist locally:

- Factory
- MAINNET_FACTORY_ADDR
- Asset
- PoolType
- ReadinessStatus
- VaultNative
- VaultJetton
- JettonRoot
- JettonWallet

Implementation must match these real exports and not guessed names.
