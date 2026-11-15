// Data access. Reads the latest snapshot written by the refresh pipeline (data/snapshot/*.json);
// falls back to the curated seed so the app always runs, even before the first refresh.
import fs from 'node:fs';
import path from 'node:path';
import type { Company, Filing, PricePoint, Quarter } from './types';
import { COMPANIES, QUARTERS, SEED_AS_OF } from '@/data/seed/companies';
import { SEED_FILINGS } from '@/data/seed/filings';

const SNAP = path.join(process.cwd(), 'data', 'snapshot');

function readJson<T>(name: string): T | undefined {
  try {
    const p = path.join(SNAP, name);
    if (!fs.existsSync(p)) return undefined;
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

interface Meta { asOf: string; filingsSource?: string; pricesSource?: string; fundamentalsSource?: string; llm?: { calls: number; inputTokens: number; outputTokens: number; costUsd: number } }

let cache: { at: number; companies: Company[]; quarters: Record<string, Quarter[]>; filings: Filing[]; prices: Record<string, PricePoint[]>; meta: Meta } | undefined;

function load() {
  if (cache && Date.now() - cache.at < 60_000) return cache;
  const meta = readJson<Meta>('meta.json') ?? { asOf: SEED_AS_OF, filingsSource: 'seed (screener.in listing of BSE filings)', fundamentalsSource: 'seed (screener.in)' };
  const snapCos = readJson<Partial<Company>[]>('companies.json') ?? [];
  const companies = COMPANIES.map((c) => ({ ...c, ...(snapCos.find((s) => s.ticker === c.ticker) ?? {}), themes: c.themes, related: c.related, holdingWeight: c.holdingWeight }));
  const quarters = { ...QUARTERS, ...(readJson<Record<string, Quarter[]>>('quarters.json') ?? {}) };
  const snapFilings = readJson<Filing[]>('filings.json');
  const filings = (snapFilings && snapFilings.length ? snapFilings : SEED_FILINGS).slice().sort((a, b) => b.at.localeCompare(a.at));
  const prices = readJson<Record<string, PricePoint[]>>('prices.json') ?? {};
  cache = { at: Date.now(), companies, quarters, filings, prices, meta };
  return cache;
}

export const getCompanies = () => load().companies;
export const getCompany = (t: string) => load().companies.find((c) => c.ticker === t.toUpperCase());
export const getQuarters = (t: string) => load().quarters[t.toUpperCase()];
export const getFilings = () => load().filings;
export const getSnapshotPrices = () => load().prices;
export const getMeta = () => load().meta;
export const isPortfolio = (t: string) => !!getCompany(t);

/**
 * The digest's "now". If the snapshot is fresh we use the real clock; if the pipeline hasn't
 * run for >36h (weekend, or before first deploy) we anchor windows to the snapshot time and say so.
 */
export function anchorTime() {
  const asOf = new Date(getMeta().asOf);
  const now = new Date();
  const stale = now.getTime() - asOf.getTime() > 36 * 3600_000;
  return { anchor: stale ? asOf : now, stale, asOf };
}
