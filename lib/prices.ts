// End-of-day prices from Yahoo Finance's public chart endpoint (same data yfinance uses). NSE tickers use ".NS".
import type { PricePoint } from './types';

export async function fetchYahoo(ticker: string, range = '6mo'): Promise<PricePoint[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}.NS?range=${range}&interval=1d&includePrePost=false`;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; FINN/0.1)' }, signal: AbortSignal.timeout(12_000), next: { revalidate: 6 * 3600 } } as RequestInit);
  if (!res.ok) throw new Error(`yahoo ${ticker} ${res.status}`);
  const j = await res.json();
  const r = j?.chart?.result?.[0];
  const ts: number[] = r?.timestamp ?? [];
  const q = r?.indicators?.quote?.[0] ?? {};
  const out: PricePoint[] = [];
  ts.forEach((t, i) => {
    const c = q.close?.[i], v = q.volume?.[i];
    if (c == null || v == null) return;
    out.push({ d: new Date(t * 1000).toISOString().slice(0, 10), c: Math.round(c * 100) / 100, v });
  });
  return out;
}
