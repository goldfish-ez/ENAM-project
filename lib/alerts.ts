// Threshold alerts on end-of-day data. Pure functions: runs in the browser so sliders re-evaluate instantly.
import type { PricePoint } from './types';

export interface Thresholds { volMultiple: number; priceMovePct: number; lookback: number }
export const DEFAULT_THRESHOLDS: Thresholds = { volMultiple: 2, priceMovePct: 4, lookback: 20 };

export interface PriceAlert {
  ticker: string; date: string; close: number; chg: number; volRatio: number;
  kinds: ('volume' | 'price')[]; spark: number[]; text: string;
}

export function computeAlerts(prices: Record<string, PricePoint[]>, th: Thresholds, daysBack = 1): PriceAlert[] {
  const out: PriceAlert[] = [];
  for (const [ticker, series] of Object.entries(prices)) {
    if (!series || series.length < th.lookback + 2) continue;
    for (let k = 0; k < daysBack; k++) {
      const i = series.length - 1 - k;
      const today = series[i], prev = series[i - 1];
      const window = series.slice(i - th.lookback, i);
      const avgVol = window.reduce((s, p) => s + p.v, 0) / window.length;
      const volRatio = avgVol ? today.v / avgVol : 0;
      const chg = ((today.c - prev.c) / prev.c) * 100;
      const kinds: PriceAlert['kinds'] = [];
      if (volRatio >= th.volMultiple) kinds.push('volume');
      if (Math.abs(chg) >= th.priceMovePct) kinds.push('price');
      if (!kinds.length) continue;
      const parts = [];
      if (kinds.includes('price')) parts.push(`${chg > 0 ? 'up' : 'down'} ${Math.abs(chg).toFixed(1)}%`);
      if (kinds.includes('volume')) parts.push(`volume ${volRatio.toFixed(1)}× its ${th.lookback}-day average`);
      out.push({ ticker, date: today.d, close: today.c, chg, volRatio, kinds, spark: series.slice(-30).map((p) => p.c), text: parts.join(', ') });
    }
  }
  return out.sort((a, b) => b.kinds.length - a.kinds.length || Math.abs(b.chg) - Math.abs(a.chg));
}
