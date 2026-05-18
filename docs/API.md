# API

## GET /health

Returns service health and active storage mode.

## POST /uploads

Accepts multipart image upload and stores it through the configured media adapter.

## GET /tokens

Query:

- `filter=trending`
- `filter=new`
- `filter=almost-graduated`
- `filter=graduated`
- `filter=top-volume`

## GET /tokens/:id

Returns full token page payload plus share URL.

## POST /tokens

Stores token metadata before contract call and returns the created token record.

## GET /tokens/:id/trades

Returns the latest trade feed for the token.

## GET /tokens/:id/comments

Returns placeholder comments for MVP.

## POST /tokens/:id/buy

Executes a bonding-curve buy in the mock runtime.

## POST /tokens/:id/sell

Executes a bonding-curve sell in the mock runtime.

## POST /referral/resolve

Validates referral code, blocks self-referral, and returns fallback status.

## POST /claim

Claim types:

- `creator`
- `referral`
- `refund`

## GET /user/:wallet

Returns:

- created tokens
- creator fee totals
- referral stats
- refund state
