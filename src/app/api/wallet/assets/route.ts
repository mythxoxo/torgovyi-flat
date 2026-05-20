import { Address } from '@ton/core';
import { NextRequest, NextResponse } from 'next/server';
import { getWalletAssets } from '../../../../lib/server/wallet-assets';
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')?.trim();
  if (!address) return NextResponse.json({ ok: false, reason: 'wallet_assets_unavailable', message: 'Wallet assets are not available yet.' }, { status: 400 });
  try { Address.parse(address); } catch { return NextResponse.json({ ok: false, reason: 'wallet_assets_unavailable', message: 'Wallet assets are not available yet.' }, { status: 400 }); }
  return NextResponse.json(await getWalletAssets(address));
}
