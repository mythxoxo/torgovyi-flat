import { Address } from '@ton/core';
import { NextRequest, NextResponse } from 'next/server';
import { getWalletAssets } from '../../../../lib/server/wallet-assets';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')?.trim();

  if (!address) {
    return NextResponse.json({
      ok: false,
      address: '',
      source: 'fallback',
      reason: 'invalid_address',
      message: 'Connect a valid TON wallet.',
      tonBalanceNano: null,
      tonBalanceFormatted: null,
      jettons: []
    });
  }

  try {
    Address.parse(address);
  } catch {
    return NextResponse.json({
      ok: false,
      address,
      source: 'fallback',
      reason: 'invalid_address',
      message: 'Invalid wallet address.',
      tonBalanceNano: null,
      tonBalanceFormatted: null,
      jettons: []
    });
  }

  return NextResponse.json(await getWalletAssets(address));
}
