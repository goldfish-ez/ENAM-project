// Push engine: filings → clustered, scored stories with FINN's take and the right person to call.
import type { Category, Filing, Quarter, Connection } from './types';
import { getCompany, getFilings, getQuarters, anchorTime } from './data';
import { getPerson, pathsTo, whoToCall } from './network';
import { cr, pct, growth, bps, yearsSpan } from './format';
import { CATEGORY_LABEL } from './classify';

export type Tier = 'act' | 'glance' | 'routine';

export interface ResultsCut {
  cur: string; prev: string; ya: string | null;
  rows: { label: string; cur: number | null; qoq: number | null; yoy: number | null }[];
  margin?: { label: string; cur: number; prev: number; ya: number | null };
  flags: string[];
}

export interface PathLite { viaId?: string; viaName?: string; viaHeadline?: string; strength?: number; links: Connection[]; score: number; why: string }
export interface PersonCard {
  id?: string; name: string; role: string; headline?: string;
  career: { title: string; org: string; years: string; approx?: boolean }[];
  education: string[]; paths: PathLite[]; provenance?: string; links?: { label: string; url: string }[];
}
export interface CallLite { personId: string; name: string; headline: string; kind: string; reason: string; caution?: string }

export interface Story {
  id: string; ticker: string; company: string; category: Category; categoryLabel: string;
  tier: Tier; score: number; at: string; headline: string; take?: string; materiality?: string;
  filings: { id: string; title: string; summary?: string; url: string; at: string }[];
  results?: ResultsCut; person?: PersonCard; calls?: CallLite[]; researchHint?: string;
}

const BASE: Record<Category, number> = {
  results: 72, 'M&A': 80, management_change: 62, fund_raise: 55, litigation: 52, insider_trading: 30,
  earnings_call: 34, investor_meetings: 8, credit_rating: 48, dividend: 30, bonus_split: 45, capex: 62,
  press_release: 44, postal_ballot: 12, agm_egm: 12, pledging: 68, unclassified: 4,
};

function groupKey(f: Filing) {
  const c = f.category ?? 'unclassified';
  if (c === 'results' || c === 'earnings_call') return 'results';
  if (c === 'fund_raise') return 'fund';
  if (c === 'management_change') return `mgmt:${f.facts?.person ?? f.facts?.personName ?? f.id}`;
  if (c === 'investor_meetings' || c === 'postal_ballot' || c === 'agm_egm' || c === 'unclassified') return `routine:${c}`;
  if (c === 'insider_trading') return `insider:${f.facts?.personName ?? 'sast'}`;
  return `${c}:${f.id}`;
}

export function resultsCut(qs: Quarter[] | undefined, lender?: boolean): ResultsCut | undefined {
  if (!qs || qs.length < 2) return undefined;
  const cur = qs[qs.length - 1], prev = qs[qs.length - 2];
  const ya = qs.find((q) => q.label === cur.label.replace(/\d{4}$/, (y) => String(+y - 1))) ?? null;
  const row = (label: string, k: keyof Quarter) => ({ label, cur: cur[k] as number | null, qoq: growth(cur[k] as number | null, prev[k] as number | null), yoy: ya ? growth(cur[k] as number | null, ya[k] as number | null) : null });
  const rows = [row(lender ? 'Total income' : 'Revenue', 'sales')];
  if (!lender) rows.push(row('EBITDA', 'ebitda'));
  rows.push(row('PBT', 'pbt'), row('PAT', 'pat'));
  const flags: string[] = [];
  let margin: ResultsCut['margin'];
  if (!lender && cur.ebitda !== null && prev.ebitda !== null) {
    margin = { label: 'EBITDA margin', cur: (cur.ebitda / cur.sales) * 100, prev: (prev.ebitda / prev.sales) * 100, ya: ya && ya.ebitda !== null ? (ya.ebitda / ya.sales) * 100 : null };
  }
  if (cur.pbt > 0 && cur.otherIncome / cur.pbt > 0.25) flags.push(`Other income is ${Math.round((cur.otherIncome / cur.pbt) * 100)}% of PBT`);
  if (cur.otherIncome < 0) flags.push(`Other income negative (${cr(cur.otherIncome)}) — check exceptional items`);
  if (ya && cur.dep / Math.max(1, ya.dep) > 1.4) flags.push(`Depreciation up ${Math.round((cur.dep / ya.dep - 1) * 100)}% YoY — new assets or acquisition`);
  return { cur: cur.label, prev: prev.label, ya: ya?.label ?? null, rows, margin, flags };
}

function resultsTake(cut: ResultsCut) {
  const rev = cut.rows[0], pat = cut.rows[cut.rows.length - 1];
  const parts: string[] = [];
  if (rev.yoy !== null) parts.push(`${rev.label.toLowerCase()} ${pct(rev.yoy, 0)} YoY`);
  if (pat.yoy !== null) parts.push(`PAT ${pct(pat.yoy, 0)}`);
  let s = parts.join(', ');
  if (cut.margin && cut.margin.ya !== null) {
    const d = (cut.margin.cur - cut.margin.ya) * 100;
    if (Math.abs(d) >= 100) s += `; EBITDA margin ${bps(d)} YoY to ${cut.margin.cur.toFixed(1)}%`;
  }
  if (rev.yoy !== null && pat.yoy !== null && rev.yoy > 5 && pat.yoy < -10) s += ' — growth isn’t reaching the bottom line';
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

function resultsHeadline(short: string, cut: ResultsCut) {
  const pat = cut.rows[cut.rows.length - 1];
  const q = cut.cur.startsWith('Sep') ? 'Q2' : cut.cur.startsWith('Dec') ? 'Q3' : cut.cur.startsWith('Mar') ? 'Q4' : 'Q1';
  if (pat.yoy === null) return `${short} ${q} results`;
  const word = pat.yoy <= -40 ? 'profit collapses' : pat.yoy <= -10 ? 'profit falls' : pat.yoy >= 25 ? 'profit jumps' : pat.yoy >= 5 ? 'profit grows' : 'profit flat';
  return `${short} ${q}: ${word} ${pct(pat.yoy, 0)} YoY`;
}

function personCard(id: string | undefined, name: string | undefined, role: string | undefined): PersonCard | undefined {
  const p = id ? getPerson(id) : undefined;
  if (!p && !name) return undefined;
  const paths = p ? pathsTo(p.id, 3).map((x) => ({ viaId: x.via?.id, viaName: x.via?.name, viaHeadline: x.via?.headline, strength: x.via?.rel?.strength, links: x.links, score: x.score, why: x.why })) : [];
  return {
    id: p?.id, name: p?.name ?? name!, role: role ?? '', headline: p?.headline,
    career: (p?.roles ?? []).slice().reverse().map((r) => ({ title: r.title, org: r.orgName, years: r.to ? yearsSpan(r.from, r.to) : `${r.from}–now`, approx: (r as { approx?: boolean }).approx })),
    education: (p?.education ?? []).map((e) => `${e.degree ? e.degree + ', ' : ''}${e.schoolName}`),
    paths, provenance: p?.provenance, links: p?.links,
  };
}

const promoterWord = (fs: Filing[]) => (fs.some((f) => /warrant/i.test(f.title + (f.summary ?? ''))) ? 'in promoter warrants' : 'raised');

const calls = (ticker: string, topic?: string, n = 2): CallLite[] =>
  whoToCall(ticker, topic, n).map((c) => ({ personId: c.person.id, name: c.person.name, headline: c.person.headline, kind: c.kind, reason: c.reason, caution: c.caution }));

export function buildStories(hours: number) {
  const { anchor, stale, asOf } = anchorTime();
  const from = anchor.getTime() - hours * 3600_000;
  const inWin = getFilings().filter((f) => { const t = new Date(f.at).getTime(); return t > from && t <= anchor.getTime() + 60_000; });
  const groups = new Map<string, Filing[]>();
  for (const f of inWin) { const k = `${f.ticker}|${groupKey(f)}`; groups.set(k, [...(groups.get(k) ?? []), f]); }

  // Context that crosses filings (e.g. results that mention an acquisition, used by fund-raise takes)
  const allRecent = getFilings();
  const stories: Story[] = [];
  for (const [key, fs] of groups) {
    const ticker = key.split('|')[0];
    const co = getCompany(ticker);
    if (!co) continue;
    const lead = fs.slice().sort((a, b) => (BASE[b.category ?? 'unclassified'] - BASE[a.category ?? 'unclassified']) || b.at.localeCompare(a.at))[0];
    let category: Category = lead.category ?? 'unclassified';
    let score = BASE[category];
    let headline = `${co.short}: ${lead.summary ?? lead.title}`;
    let take: string | undefined, materiality: string | undefined, person: PersonCard | undefined, results: ResultsCut | undefined, researchHint: string | undefined;
    let callList: CallLite[] | undefined;

    if (key.endsWith('|results')) {
      const hasResults = fs.some((f) => f.category === 'results');
      results = resultsCut(getQuarters(ticker), co.lender);
      if (hasResults && results) {
        category = 'results';
        headline = resultsHeadline(co.short, results);
        take = resultsTake(results);
        const pat = results.rows[results.rows.length - 1].yoy ?? 0;
        score = 70 + Math.min(20, Math.abs(pat) / 3);
        const extra = fs.find((f) => f.category === 'results' && f.summary && /YoY|PAT\b|AUM|EBITDA/.test(f.summary));
        if (extra) take += ` Company says: ${extra.summary}`;
        callList = calls(ticker, undefined, 2);
      } else {
        category = 'earnings_call';
        results = undefined;
        headline = `${co.short}: earnings-call transcript is in`;
        take = 'New primary source. FINN re-checks what management promised against what it delivered.';
        researchHint = 'guidance';
        score = 36;
      }
    } else if (category === 'management_change') {
      const f = fs.find((x) => x.facts?.person) ?? lead;
      person = personCard(f.facts?.person, f.facts?.personName, f.facts?.role);
      const role = f.facts?.role ?? '';
      const top = /\b(MD|CEO|CFO|Chairman|Chair)\b/i.test(role);
      const re = /reappoint/i.test(role);
      score = top ? 86 : re ? 50 : 44;
      headline = `${co.short}: ${person?.name ?? f.facts?.personName ?? 'management change'} — ${role || 'management change'}`;
      take = [f.facts?.note, f.summary].filter(Boolean).join('. ');
      if (person?.paths.length) score += 6;
      callList = calls(ticker, undefined, 2);
    } else if (category === 'fund_raise') {
      const seen = new Set<number>();
      let total = 0;
      for (const f of fs) { const a = f.facts?.amountCr; if (a && !seen.has(a)) { seen.add(a); total += a; } }
      const share = total ? (total / co.mcap) * 100 : 0;
      score = total ? Math.min(88, 45 + share * 4) : 40;
      const allotted = fs.some((f) => /allot/i.test(f.title + (f.summary ?? '')));
      const approvalOnly = !allotted && fs.some((f) => /approv/i.test(f.summary ?? ''));
      const qipOpen = fs.some((f) => /qip opened|opens qip/i.test(f.title + ' ' + (f.summary ?? '')));
      headline = !total ? `${co.short}: ${lead.summary ?? lead.title}`
        : approvalOnly ? `${co.short}: board clears up to ${cr(total)} capital raise`
        : seen.size > 1 ? `${co.short} raised ${cr(total)} in ${Math.max(1, Math.round((new Date(fs[0].at).getTime() - new Date(fs.at(-1)!.at).getTime()) / 86400000))} days across ${seen.size} instruments`
        : `${co.short}: ${cr(total)} ${promoterWord(fs)}${qipOpen ? ', plus a QIP launched' : ''}`;
      if (total) materiality = `${share.toFixed(1)}% of market cap`;
      const promoter = fs.find((f) => /promoter/i.test(f.facts?.counterparty ?? '') || /warrant/i.test(f.title));
      const deal = allRecent.find((f) => f.ticker === ticker && f.facts?.counterparty && f.category === 'results');
      const notes = fs.map((f) => f.facts?.note).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
      take = [
        notes.length ? notes.join(' · ').replace(/^./, (c) => c.toUpperCase()) + '.' : '',
        promoter ? `Promoter is putting in money (${promoter.facts?.counterparty ?? 'warrants'}) — a vote of confidence at roughly the market price.` : '',
        deal ? `Same quarter's results booked costs for the ${deal.facts!.counterparty} acquisition — the raise likely funds it.` : '',
      ].filter(Boolean).join(' ');
      if (deal) { score += 8; callList = calls(ticker, deal.facts!.counterparty, 2); }
    } else if (category === 'litigation') {
      const amt = lead.facts?.amountCr;
      const ttm = (getQuarters(ticker) ?? []).slice(-4).reduce((s, q) => s + q.sales, 0);
      if (amt !== undefined && ttm) {
        const p = (amt / ttm) * 100;
        materiality = p < 0.01 ? `Immaterial: ${cr(amt)} is ${p.toFixed(4)}% of annual revenue` : `${p.toFixed(2)}% of annual revenue`;
        score = p < 0.01 ? 14 : 55;
      } else score = /nclat|nclt|cirp|msci/i.test(fs.map((f) => f.summary).join(' ')) ? 66 : 52;
      headline = `${co.short}: ${lead.summary ?? lead.title}`;
      if (fs.length > 1) take = fs.slice(1).map((f) => f.summary).join(' ');
      if (score > 50) callList = calls(ticker, 'insolvency', 2);
    } else if (category === 'insider_trading') {
      const promoter = fs.some((f) => /promoter/i.test(f.facts?.role ?? ''));
      score = promoter ? 58 : 22;
      headline = promoter ? `${co.short}: promoter ${lead.facts?.personName} sold shares` : `${co.short}: ${fs.length} substantial-holding disclosure${fs.length > 1 ? 's' : ''} (SAST 29(2))`;
      take = promoter ? 'Promoter selling after a sharp fall in the stock is worth a question at the next meet.' : 'Large holder crossing a disclosure threshold. FINN will flag it if it’s the promoter group or it keeps happening.';
    } else if (category === 'press_release') {
      const order = /order/i.test(lead.title);
      score = order ? 52 : /rumou?r|clarif/i.test(lead.title) ? 62 : 40;
      headline = `${co.short}: ${lead.summary ?? lead.title}`;
      if (/rumou?r|clarif/i.test(lead.title)) { take = 'Exchange asked the company to respond to a press report on a plant halt. The plant is the thing to check, not the stock move.'; callList = calls(ticker, undefined, 2); }
      if (order) take = 'Order value not disclosed in the filing. FINN reads the PDF for a size band when the bulk model is on.';
    } else if (category === 'M&A') {
      headline = `${co.short}: ${lead.summary ?? lead.title}`;
      callList = calls(ticker, undefined, 2);
    } else if (key.includes('|routine:')) {
      headline = `${co.short}: ${fs.length > 1 ? `${fs.length} × ` : ''}${CATEGORY_LABEL[category]}`;
      score = BASE[category];
    }

    stories.push({
      id: key, ticker, company: co.short, category, categoryLabel: CATEGORY_LABEL[category],
      tier: score >= 65 ? 'act' : score >= 38 ? 'glance' : 'routine', score: Math.round(score), at: fs.map((f) => f.at).sort().at(-1)!,
      headline, take, materiality, results, person, calls: callList, researchHint,
      filings: fs.map((f) => ({ id: f.id, title: f.title, summary: f.summary, url: f.url, at: f.at })),
    });
  }
  stories.sort((a, b) => b.score - a.score || b.at.localeCompare(a.at));
  return { stories, anchor: anchor.toISOString(), stale, asOf: asOf.toISOString(), filingsInWindow: inWin.length };
}
