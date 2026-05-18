# Risks

- Arbitrage risk: a deterministic bonding curve can drift from secondary-market pricing after graduation.
- Curve parameter risk: poor price slope choices can leave too little reserve for useful post-graduation liquidity.
- STON.fi integration risk: until the mock adapter is replaced, graduation is simulated rather than fully on-chain.
- Bot sniping risk: the first-minute max buy guard reduces but does not eliminate coordinated launches.
- Referral abuse risk: self-referral is blocked, but broader Sybil detection is still minimal in MVP.
- Telegram dependency risk: Mini App distribution and bot entry rely on Telegram uptime and policy.
- Liquidity risk: even correct migration can result in a shallow initial STON.fi pool if the token barely reaches threshold.
