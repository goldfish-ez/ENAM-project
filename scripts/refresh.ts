// Evening refresh (GitHub Actions cron, 19:00 IST on market days): `npm run refresh`
// Pulls EOD prices (Yahoo), filings (BSE), fundamentals (screener.in) for the portfolio,
// classifies filings with rules, and — only for material filings — asks the bulk model to
// extract facts (amount, person, role, counterparty). Results are cached by filing id, so a
// filing is sent to a model at most once, ever. Writes data/snapshot/*.json.
import fs from 'node:fs';
import path from 'node:path';
import { COMPANIES } from '../data/seed/companies';
import { ALL_PEOPLE } from '../data/seed/people';
import { fetchYahoo } from '../lib/prices';
import { fetchScreener } from '../lib/screener';
import { fetchBseFilings } from '../lib/bse';
import { generateJson, llmEnabled, type LlmUsage } from '../lib/llm';
import type { Filing, FilingFacts, PricePoint, Quarter, Company } from '../lib/types';

const OUT = path.join(process.cwd(), 'data', 'snapshot');
fs.mkdirSync(OUT, { recursive: true });
const read = <T,>(f: string, d: T): T => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch { return d; } };
const write = (f: string, v: unknown) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(v, null, 1));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MATERIAL = new Set(['management_change', 'fund_raise', 'M&A', 'litigation', 'insider_trading', 'capex', 'pledging', 'press_release']);
const SYS = `Extract facts from an Indian stock-exchange filing subject and summary. Return JSON {"amountCr": number|null (₹ crore; convert lakh/million/billion), "personName": string|null, "role": string|null, "counterparty": string|null, "note": string|null (<=12 words, only if important)}. Use only the text given.`;

async function main() {
  const prices: Record<string, PricePoint[]> = read('prices.json', {});
  const quarters: Record<string, Quarter[]> = read('quarters.json', {});
  const companies: Partial<Company>[] = read('companies.json', []);
  const enrich: Record<string, FilingFacts> = read('enrich.json', {});
  let filings: Filing[] = [];
  const usage: LlmUsage[] = [];
  const errors: string[] = [];

  for (const co of COMPANIES) {
    try { const p = await fetchYahoo(co.ticker, '6mo'); if (p.length) prices[co.ticker] = p; } catch (e) { errors.push(`prices ${co.ticker}: ${(e as Error).message}`); }
    try {
      const f = await fetchScreener(co.ticker);
      quarters[co.ticker] = f.quarters.slice(-8);
      const i = companies.findIndex((c) => c.ticker === co.ticker);
      const upd = { ticker: co.ticker, price: f.price ?? co.price, mcap: f.mcap ?? co.mcap, priceAsOf: new Date().toISOString().slice(0, 10) };
      if (i >= 0) companies[i] = upd; else companies.push(upd);
    } catch (e) { errors.push(`screener ${co.ticker}: ${(e as Error).message}`); }
    try { filings.push(...(await fetchBseFilings(co.ticker, co.bse, 30))); } catch (e) { errors.push(`bse ${co.ticker}: ${(e as Error).message}`); }
    await sleep(1200); // be polite to public endpoints
  }

  // Fact extraction for material filings only (bulk model, cached forever by filing id).
  const names = ALL_PEOPLE.map((p) => [p.name.toLowerCase(), p.id] as const);
  for (const f of filings) {
    if (!MATERIAL.has(f.category ?? '')) continue;
    if (!enrich[f.id] && llmEnabled()) {
      try { const { data, usage: u } = await generateJson<FilingFacts>('bulk', SYS, `Subject: ${f.title}\nSummary: ${f.summary ?? ''}`, 300); enrich[f.id] = data; usage.push(u); }
      catch (e) { errors.push(`llm ${f.id}: ${(e as Error).message}`); }
    }
    const facts = enrich[f.id];
    if (facts) {
      const hit = facts.personName ? names.find(([n]) => facts.personName!.toLowerCase().includes(n)) : undefined;
      f.facts = { ...facts, person: hit?.[1] };
    }
  }
  filings = filings.sort((a, b) => b.at.localeCompare(a.at));

  if (filings.length) write('filings.json', filings);
  write('prices.json', prices); write('quarters.json', quarters); write('companies.json', companies); write('enrich.json', enrich);
  const prev = read<{ llm?: { calls: number; inputTokens: number; outputTokens: number; costUsd: number } }>('meta.json', {});
  write('meta.json', {
    asOf: new Date().toISOString(), filingsSource: filings.length ? 'BSE announcements API' : 'seed', pricesSource: 'Yahoo Finance chart API', fundamentalsSource: 'screener.in',
    llm: { calls: usage.length, inputTokens: usage.reduce((s, u) => s + u.inputTokens, 0), outputTokens: usage.reduce((s, u) => s + u.outputTokens, 0), costUsd: +usage.reduce((s, u) => s + u.costUsd, 0).toFixed(5), lifetimeCalls: ((prev.llm?.calls ?? 0) + usage.length) },
    errors,
  });
  console.log(`filings ${filings.length}, priced ${Object.keys(prices).length}, quarters ${Object.keys(quarters).length}, llm calls ${usage.length} ($${usage.reduce((s, u) => s + u.costUsd, 0).toFixed(4)}), errors ${errors.length}`);
  if (errors.length) console.log(errors.join('\n'));
}
main().catch((e) => { console.error(e); process.exit(1); });
