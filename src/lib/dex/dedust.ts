import { Address, beginCell, toNano } from '@ton/core';
import type { PrepareDedustLiquidityInput, PreparedDedustLiquidityTx } from './types';

const assertAddr = (value: string, name: string) => {
  try { return Address.parse(value).toString(); } catch { throw new Error(`${name} is invalid`); }
};

export function prepareDedustLiquidityDraft(input: PrepareDedustLiquidityInput): PreparedDedustLiquidityTx {
  const jettonMaster = assertAddr(input.jettonMaster, 'jetton');
  const pool = assertAddr(input.pool, 'pool');
  if (!input.tokenAmount || Number(input.tokenAmount) <= 0) throw new Error('amount-jetton must be > 0');
  if (!input.tonAmountNano || BigInt(input.tonAmountNano) <= 0n) throw new Error('amount-ton must be > 0');
  if (input.slippageBps < 0 || input.slippageBps > 5000) throw new Error('slippage-bps out of range');

  const payload = beginCell()
    .storeUint(0xdec001, 32)
    .storeAddress(Address.parse(pool))
    .storeAddress(Address.parse(jettonMaster))
    .storeCoins(BigInt(input.tonAmountNano))
    .storeUint(BigInt(input.tokenAmount), 64)
    .storeUint(input.slippageBps, 16)
    .endCell()
    .toBoc()
    .toString('base64');

  return {
    dex: 'dedust',
    mode: 'dry-run',
    status: 'payload scaffold',
    title: 'Prepare DeDust liquidity draft',
    description: 'Manual DeDust migration scaffold. Exact live payload still requires final on-chain verification before signing.',
    messages: [{ address: pool, amount: BigInt(input.tonAmountNano).toString(), payload }],
    warnings: [
      'manual signing required',
      'live execution not verified',
      'exact DeDust pool/vault payload must be verified before mainnet signing'
    ],
    validUntil: Math.floor(Date.now() / 1000) + 900,
    manualSigningRequired: true,
    liveExecutionVerified: false
  };
}

export const tonToNanoString = (amountTon: string) => toNano(amountTon).toString();
