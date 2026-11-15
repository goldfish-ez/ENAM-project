'use client';
// Investor preferences live on-device (localStorage): what "unusual" means and which filing types interrupt.
import { useEffect, useState, useCallback } from 'react';
import type { Category } from './types';
import { DEFAULT_THRESHOLDS, type Thresholds } from './alerts';

export type CatMode = 'alert' | 'digest' | 'mute';
export interface Prefs { thresholds: Thresholds; cats: Partial<Record<Category, CatMode>>; done: string[] }

export const DEFAULT_CATS: Partial<Record<Category, CatMode>> = {
  results: 'alert', 'M&A': 'alert', management_change: 'alert', fund_raise: 'alert', litigation: 'alert', pledging: 'alert', capex: 'alert',
  insider_trading: 'digest', credit_rating: 'digest', press_release: 'digest', earnings_call: 'digest', dividend: 'digest', bonus_split: 'digest',
  investor_meetings: 'mute', postal_ballot: 'mute', agm_egm: 'mute', unclassified: 'mute',
};
const DEFAULT: Prefs = { thresholds: DEFAULT_THRESHOLDS, cats: DEFAULT_CATS, done: [] };
const KEY = 'finn.prefs.v1';

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) }); } catch {}
  }, []);
  const update = useCallback((fn: (p: Prefs) => Prefs) => {
    setPrefs((p) => { const n = fn(p); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; });
  }, []);
  return [prefs, update] as const;
}

/** Re-tier a story with the investor's own rules. Muted types never interrupt; "alert" types surface if they clear a materiality floor. */
export function tierFor(score: number, cat: Category, prefs: Prefs): 'act' | 'glance' | 'routine' {
  const mode = prefs.cats[cat] ?? DEFAULT_CATS[cat] ?? 'digest';
  if (mode === 'mute') return 'routine';
  if (mode === 'alert') return score >= 60 ? 'act' : score >= 30 ? 'glance' : 'routine';
  return score >= 70 ? 'act' : score >= 38 ? 'glance' : 'routine';
}
