// Pull engine. Works for any NSE ticker with a screener.in page.
//   1. Numbers (deterministic): screener tables → trajectory, balance sheet, cash quality.
//   2. Transcripts (bulk model, parallel): last 4 concall PDFs → keyword-chunked → guidance statements + reported figures.
//   3. Synthesis (reasoning model, one call): promised vs delivered, narrative vs numbers, bull/bear.
// Grounding rule: only primary documents go into the model. No news, no broker notes, no model memory.
import type { Fundamentals, Research, GuidanceItem } from './types';
import { fetchScreener } from './screener';
import { generateJson, llmEnabled, type LlmUsage } from './llm';
import { SEED_FUNDAMENTALS, CURATED } from '@/data/seed/research';
import { cr, pct, growth, bps } from './format';
import { getCompany, getQuarters } from './data';

const cache = new Map<string, { at: number; value: ResearchResult }>();
export interface ResearchResult { research: Research; fundamentals: Fundamentals; usage: LlmUsage[]; steps: string[]; error?: string }

const ratio = (a?: number | null, b?: number | null) => (a === null || a === undefined || !b ? null : a / b);
const last = <T,>(a?: (T | null)[]) => (a && a.length ? a[a.length - 1] : null);
const cagr = (a: number | null, b: number | null, yrs: number) => (a && b && a > 0 && b > 0 ? (Math.pow(b / a, 1 / yrs) - 1) * 100 : null);

export function analyzeNumbers(f: Fundamentals): Pick<Research, 'numbers' | 'trajectory' | 'balance' | 'cash'> {
  const qs = f.quarters;
  const cur = qs.at(-1)!;
  const ya = qs.find((q) => q.label === cur.label.replace(/\d{4}$/, (y) => String(+y - 1)));
  const ttm = qs.slice(-4);
  const ttmSales = ttm.reduce((s, q) => s + q.sales, 0), ttmPat = ttm.reduce((s, q) => s + q.pat, 0);
  const m = (q: typeof cur) => (q.ebitda !== null ? (q.ebitda / q.sales) * 100 : null);
  const numbers: Research['numbers'] = [];
  if (f.mcap) numbers.push({ label: 'Market cap', value: cr(f.mcap) });
  if (f.pe) numbers.push({ label: 'P/E', value: `${f.pe.toFixed(1)}×` });
  numbers.push({ label: 'Revenue (TTM)', value: cr(ttmSales), sub: ya ? `latest qtr ${pct(growth(cur.sales, ya.sales), 0)} YoY` : undefined, tone: ya && cur.sales > ya.sales ? 'up' : 'down' });
  numbers.push({ label: 'PAT (TTM)', value: cr(ttmPat), sub: ya ? `latest qtr ${pct(growth(cur.pat, ya.pat), 0)} YoY` : undefined, tone: ya && cur.pat >= ya.pat ? 'up' : 'down' });
  if (!f.lender && m(cur) !== null) numbers.push({ label: 'EBITDA margin', value: `${m(cur)!.toFixed(1)}%`, sub: ya && m(ya) !== null ? `${bps((m(cur)! - m(ya)!) * 100)} YoY` : undefined, tone: ya && m(ya)! > m(cur)! ? 'down' : 'up' });
  if (f.roce) numbers.push({ label: 'ROCE', value: `${f.roce.toFixed(1)}%` });
  if (f.roe) numbers.push({ label: 'ROE', value: `${f.roe.toFixed(1)}%` });

  const a = f.annual;
  const t: string[] = [], b: string[] = [], c: string[] = [];
  if (a && a.sales.length >= 4) {
    const n = a.sales.length;
    const c3 = cagr(a.sales[n - 4], a.sales[n - 1], 3), c5 = n >= 6 ? cagr(a.sales[n - 6], a.sales[n - 1], 5) : null;
    t.push(`Revenue compounded ${c3?.toFixed(0)}% a year over 3 years${c5 ? ` (${c5.toFixed(0)}% over 5)` : ''}, to ${cr(a.sales[n - 1])} in ${a.years[n - 1].replace('Mar ', 'FY')}.`);
    if (a.op && !f.lender) {
      const o0 = ratio(a.op[n - 4], a.sales[n - 4]), o1 = ratio(a.op[n - 1], a.sales[n - 1]);
      if (o0 !== null && o1 !== null) t.push(`Operating margin ${o1 > o0 ? 'expanded' : 'compressed'} from ${(o0 * 100).toFixed(1)}% to ${(o1 * 100).toFixed(1)}% over the same period.`);
    }
    const ys = a.sales.slice(-3);
    if (ys[2]! < ys[1]!) t.push(`Revenue fell ${pct(growth(ys[2], ys[1]), 0)} in the latest year — the first decline in the series.`);
  }
  if (ya) {
    const rg = growth(cur.sales, ya.sales)!, pg = growth(cur.pat, ya.pat)!;
    t.push(`Latest quarter (${cur.label}): revenue ${pct(rg, 0)} YoY, PAT ${pct(pg, 0)} YoY${rg - pg > 15 ? ' — profit growth well behind revenue' : pg - rg > 15 ? ' — operating leverage is kicking in' : ''}.`);
    if (cur.pbt > 0 && cur.otherIncome / cur.pbt > 0.25) t.push(`Other income is ${Math.round((cur.otherIncome / cur.pbt) * 100)}% of this quarter's PBT — core profit is thinner than the headline.`);
  }
  if (a) {
    const n = a.years.length;
    const de = ratio(last(a.borrowings), last(a.equity)), de3 = a.borrowings && a.equity && n >= 4 ? ratio(a.borrowings[n - 4], a.equity[n - 4]) : null;
    if (f.lender) b.push('Lender: balance-sheet strength is about capital adequacy, asset quality and liability franchise. Those come from the investor presentation, which the live engine reads.');
    else if (de !== null) b.push(`Debt-to-equity ${de.toFixed(2)}${de3 !== null ? ` (was ${de3.toFixed(2)} three years ago)` : ''}: ${de < 0.1 ? 'effectively debt-free' : de < 0.5 ? 'comfortable' : de < 1 ? 'meaningful leverage' : 'highly levered'}.`);
    if (a.equity) { const e0 = a.equity[n - 4], e1 = last(a.equity); if (e0 && e1) b.push(`Shareholders' equity grew from ${cr(e0)} to ${cr(e1)} in three years.`); }
    if (a.ccc) { const x0 = a.ccc[n - 4], x1 = last(a.ccc); if (x0 !== null && x1 !== null) b.push(`Cash conversion cycle ${x1 > x0 ? 'lengthened' : 'shortened'} from ${x0} to ${x1} days${x1 < 0 ? ' (suppliers fund the working capital)' : ''}.`); }
    if (a.cfoToOp) {
      const r3 = a.cfoToOp.slice(-3).filter((v): v is number => v !== null), p3 = a.cfoToOp.slice(-6, -3).filter((v): v is number => v !== null);
      const avg = (x: number[]) => x.reduce((s, v) => s + v, 0) / x.length;
      if (r3.length) c.push(`Operating cash flow was ${avg(r3).toFixed(0)}% of operating profit over the last 3 years${p3.length ? ` vs ${avg(p3).toFixed(0)}% in the 3 before` : ''}. ${avg(r3) >= 85 ? 'Profits are turning into cash.' : avg(r3) >= 65 ? 'Acceptable, but watch it.' : 'Profits are not turning into cash — a red flag.'}`);
      const lastV = last(a.cfoToOp); if (lastV !== null && lastV < 60) c.push(`Latest year conversion only ${lastV}%.`);
    }
    if (a.fcf) { const f3 = a.fcf.slice(-3).reduce<number>((s, v) => s + (v ?? 0), 0); c.push(`Free cash flow over 3 years: ${cr(f3)}${last(a.fcf)! < 0 ? `; negative in the latest year (${cr(last(a.fcf))})` : ''}.`); }
    if (a.debtorDays) { const d0 = a.debtorDays[n - 3], d1 = last(a.debtorDays); if (d0 !== null && d1 !== null && Math.abs(d1 - d0) >= 10) c.push(`Receivable days ${d1 > d0 ? 'up' : 'down'} from ${d0} to ${d1} in two years${d1 > d0 ? ' — customers are paying slower' : ''}.`); }
  }
  return { numbers, trajectory: { insight: t }, balance: { insight: b }, cash: { insight: c } };
}

// ---------------- transcripts ----------------

const KEY = /guid|expect|target|aspir|outlook|margin|growth|capex|double[- ]digit|bps|basis points|FY ?'?2\d|next (year|quarter)|visibility|order book|pipeline|run[- ]rate|we (will|should|aim)|by the end of/i;

async function transcriptText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 FINN/0.1', referer: 'https://www.bseindia.com/' }, signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`transcript ${res.status}`);
  const { extractText, getDocumentProxy } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: true });
  const t = Array.isArray(text) ? text.join('\n') : text;
  // Chunking: keep prepared remarks + only paragraphs that talk about the future or targets.
  const paras = t.split(/\n{2,}|(?<=[.?!])\s{2,}/).map((p) => p.trim()).filter(Boolean);
  const head = t.slice(0, 3500);
  const hits = paras.filter((p) => KEY.test(p) && p.length > 60);
  return (head + '\n…\n' + hits.join('\n')).slice(0, 14_000);
}

interface Extract { quarter: string; statements: { metric: string; claim: string; horizon?: string; quote: string; speaker?: string }[]; reported: { metric: string; value: string }[]; tone: string }

const SYS_EXTRACT = `You extract forward-looking statements from an Indian listed company's earnings-call transcript.
Use ONLY the transcript text given. Never add outside knowledge. Return JSON:
{"quarter":"e.g. Q2 FY27","statements":[{"metric":"revenue growth|EBITDA margin|EBIT margin|capex|volume|order book|other","claim":"what management said they expect, in plain words","horizon":"e.g. FY27","quote":"verbatim, max 20 words","speaker":"name or role if given"}],"reported":[{"metric":"...","value":"..."}],"tone":"one sentence on confidence/hedging"}
Max 6 statements; prefer explicit numeric targets. If none, return an empty list.`;

const SYS_SYNTH = `You are an analyst checking an Indian listed company's management against its own words.
Inputs: (a) guidance statements extracted from the last few earnings calls, with verbatim quotes; (b) the reported quarterly numbers.
Use ONLY these inputs. No outside knowledge, no news, no broker views. Quotes must be copied from the inputs.
Return JSON:
{"business":"2 sentences on what the company does, from inputs only (or empty)",
 "guidance":[{"promise":"...","metric":"...","said":[{"when":"Q? FY??","quote":"...","who":"..."}],"delivered":[{"label":"...","value":"...","note":"..."}],"status":"met|on-track|at-risk|missed|unclear","verdict":"1-2 sentences, specific numbers"}],
 "tone":["how the language shifted across calls"],
 "narrative":{"agree":["where story and numbers agree"],"diverge":["where they diverge"]},
 "bull":["max 3"],"bear":["max 3"]}
Be specific and numeric. 2-4 guidance items. If a promise cannot be checked against the numbers, mark it "unclear".`;

async function transcriptResearch(f: Fundamentals, usage: LlmUsage[], steps: string[]): Promise<Partial<Research>> {
  const ts = (f.docs ?? []).filter((d) => d.kind === 'transcript').slice(0, 4);
  if (!ts.length) { steps.push('No transcripts linked on screener.in — guidance check skipped'); return {}; }
  const texts = await Promise.allSettled(ts.map((d) => transcriptText(d.url)));
  const ok = ts.map((d, i) => ({ d, r: texts[i] })).filter((x) => x.r.status === 'fulfilled') as { d: (typeof ts)[number]; r: PromiseFulfilledResult<string> }[];
  steps.push(`Read ${ok.length}/${ts.length} transcripts (keyword-chunked to ≤14k chars each)`);
  if (!ok.length) return {};
  const extracts = await Promise.all(ok.map(async ({ d, r }) => {
    const { data, usage: u } = await generateJson<Extract>('bulk', SYS_EXTRACT, `Transcript (${d.label}):\n${r.value}`, 2048);
    usage.push(u); return { ...data, url: d.url, label: d.label };
  }));
  steps.push(`Extracted ${extracts.reduce((s, e) => s + e.statements.length, 0)} guidance statements with ${usage[0]?.model}`);
  const table = f.quarters.map((q) => `${q.label}: revenue ${q.sales}, EBITDA ${q.ebitda ?? 'n/a'}, PBT ${q.pbt}, PAT ${q.pat} (₹ cr)`).join('\n');
  const { data, usage: u } = await generateJson<{ business?: string; guidance: GuidanceItem[]; tone: string[]; narrative: Research['narrative']; bull: string[]; bear: string[] }>(
    'reason', SYS_SYNTH, `Company: ${f.name} (${f.ticker})\n\nReported quarterly numbers:\n${table}\n\nExtracted guidance (newest first):\n${JSON.stringify(extracts, null, 1)}`, 4096);
  usage.push(u);
  steps.push(`Synthesised promised-vs-delivered with ${u.model}`);
  for (const g of data.guidance ?? []) for (const s of g.said ?? []) s.url ??= extracts.find((e) => e.quarter === s.when)?.url;
  return { business: data.business ? { what: data.business } : undefined, guidance: data.guidance, tone: data.tone, narrative: data.narrative, bull: data.bull, bear: data.bear,
    sources: ok.map(({ d }) => ({ label: `Call transcript — ${d.label}`, url: d.url })) };
}

function minimal(T: string): Fundamentals | undefined {
  const co = getCompany(T), qs = getQuarters(T);
  if (!co || !qs) return undefined;
  return { ticker: T, name: co.name, price: co.price, mcap: co.mcap, lender: co.lender, quarters: qs, source: { label: 'screener.in (snapshot)', url: `https://www.screener.in/company/${T}/consolidated/` } };
}

export async function getResearch(ticker: string, opts: { live?: boolean } = {}): Promise<ResearchResult> {
  const T = ticker.toUpperCase().trim();
  const key = `${T}|${opts.live ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 6 * 3600_000) return hit.value;
  const usage: LlmUsage[] = [], steps: string[] = [];
  let f: Fundamentals | undefined = !opts.live ? SEED_FUNDAMENTALS[T] : undefined;
  let error: string | undefined;
  if (f) steps.push('Fundamentals from snapshot (screener.in, 13 Nov 2026)');
  else {
    try { f = await fetchScreener(T); steps.push(`Fetched ${f.quarters.length} quarters + ${f.annual?.years.length ?? 0} years from screener.in`); }
    catch (e) {
      error = `Live fetch failed (${(e as Error).message})`;
      f = SEED_FUNDAMENTALS[T] ?? minimal(T);
      if (f) steps.push('Live fetch failed — showing the latest snapshot instead');
    }
  }
  if (!f) throw new Error(error ?? `No data for ${T}`);
  const base = analyzeNumbers(f);
  steps.push('Computed trajectory, balance sheet and cash quality deterministically');
  let research: Research = { ticker: T, name: f.name, asOf: new Date().toISOString(), mode: 'numbers-only', business: f.about ? { what: f.about } : undefined, ...base, sources: [f.source] };
  const curated = !opts.live ? CURATED[T] : undefined;
  if (curated) {
    research = { ...research, ...curated, mode: 'curated', sources: [...(curated.sources ?? []), f.source] } as Research;
    steps.push('Guidance ledger: curated from primary transcripts');
  } else if (llmEnabled() && f.docs?.length) {
    try {
      const t = await transcriptResearch(f, usage, steps);
      research = { ...research, ...t, business: t.business ?? research.business, mode: 'live', model: usage.map((u) => u.model).filter((v, i, a) => a.indexOf(v) === i).join(' + '), sources: [...(t.sources ?? []), f.source] };
    } catch (e) { error = `Transcript analysis failed: ${(e as Error).message}`; steps.push(error); }
  } else if (!llmEnabled()) steps.push('Set GEMINI_API_KEY to add the guidance-vs-delivery check from transcripts');
  const value = { research, fundamentals: f, usage, steps, error };
  cache.set(key, { at: Date.now(), value });
  return value;
}
