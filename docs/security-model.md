# Security model

## Secret handling

- Never print `DEPLOYER_MNEMONIC` in logs.
- Never print `LISTING_WALLET_MNEMONIC` in logs.
- Never commit `.env`, `.env.local`, `.env.production`, or any secret env file.
- Commands must support `--dry-run` before `--execute`.

## Authority gate

A token is not live unless JettonMinter admin/owner equals Pool address.

Required sequence:
1. Deploy JettonMinter with initial owner = creator.
2. Deploy Pool with `jettonMaster = JettonMinter`.
3. Execute `ChangeOwner` on JettonMinter to Pool.
4. Verify on-chain `get_jetton_data().adminAddress == Pool`.
5. Only then register pair in Factory.
6. Only then allow live buy / mark token live.

## Registry fallback rule

Factory is currently the source of discovery via explicit on-chain registry registration.
A pair must not be treated as live if:
- registry missing, or
- minter authority not transferred to Pool.

## Buy safety

- Pool must reject buys after graduation/listing.
- Buyer receipt of Jettons must be verified by Jetton wallet balance.
- Indexer status must remain non-live/authority-pending if authority transfer is incomplete.
