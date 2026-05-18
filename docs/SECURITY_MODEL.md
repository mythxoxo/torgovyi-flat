# SECURITY MODEL

## No-custody path

- deploy/register/buy can be prepared as TonConnect-compatible payloads
- user signs in wallet manually
- backend does not need custody of user funds

## Authority rule

A token is not live unless JettonMinter admin/owner equals Pool.

If authority is not transferred:
- status must stay non-live / authority-pending
- buy must not be treated as live production path
- registration as live should not proceed

## Config rule

- production default target: 8888 TON
- manual test target: 5 TON
- never leave production accidentally on test target
