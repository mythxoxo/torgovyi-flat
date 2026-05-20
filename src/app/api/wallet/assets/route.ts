import { NextRequest, NextResponse } from 'next/server';
import { getWalletAssets } from '../../../../lib/server/wallet-assets';
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ ok: false, address: '', jettons: [], source: 'fallback', error: 'address is required' }, { status: 400 });
  return NextResponse.json(await getWalletAssets(address));
}
