import { NextResponse } from 'next/server';
import { getCompanies, getSnapshotPrices, getMeta } from '@/lib/data';
import { fetchYahoo } from '@/lib/prices';

export const dynamic = 'force-dynamic'; // per-ticker fetches are cached 6h inside fetchYahoo

// Snapshot first (written by the evening pipeline); live Yahoo as a fallback so alerts work before the first refresh.
export async function GET() {
  const snap = getSnapshotPrices();
  const fresh = Object.values(snap).some((s) => s?.length && Date.now() - new Date(s.at(-1)!.d).getTime() < 5 * 86400_000);
  if (Object.keys(snap).length && fresh) return NextResponse.json({ prices: snap, source: `snapshot · ${new Date(getMeta().asOf).toLocaleDateString('en-IN')}` });
  const cos = getCompanies();
  const results = await Promise.allSettled(cos.map((c) => fetchYahoo(c.ticker)));
  const prices: Record<string, unknown> = {};
  results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value.length) prices[cos[i].ticker] = r.value; });
  if (Object.keys(prices).length) return NextResponse.json({ prices, source: 'Yahoo Finance (live EOD)' });
  if (Object.keys(snap).length) return NextResponse.json({ prices: snap, source: 'snapshot (stale)' });
  return NextResponse.json({ prices: {}, source: 'none' });
}
