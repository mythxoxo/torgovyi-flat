import { NextResponse } from 'next/server';
import { fetchTonPriceUsd } from '../../../../lib/server/ton-price';
export const revalidate = 90;
export async function GET() {
  const { usd, source } = await fetchTonPriceUsd();
  return NextResponse.json({ usd, source });
}
