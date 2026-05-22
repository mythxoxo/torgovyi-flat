import { Address } from '@ton/core';
import { NextRequest, NextResponse } from 'next/server';
import { getWalletAssets } from '../../../../lib/server/wallet-assets';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')?.trim();

  if (!address) {
    return NextResponse.json({
      ok: false,
      reason: 'invalid_wallet_address',
      message: 'Connect a TON wallet to view assets.',
      tonBalanceFormatted: '—',
      jettons: []
    });
  }

  try {
    Address.parse(address);
  } catch {
    return NextResponse.json({
      ok: false,
      reason: 'invalid_wallet_address',
      message: 'Connect a TON wallet to view assets.',
      tonBalanceFormatted: '—',
      jettons: []
    });
  }

  return NextResponse.json(await getWalletAssets(address));
}
