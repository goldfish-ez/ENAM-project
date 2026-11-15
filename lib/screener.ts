// screener.in company page → Fundamentals. Shared by the refresh pipeline and live Pull.
import * as cheerio from 'cheerio';
import type { Annual, Fundamentals, Quarter } from './types';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36';

export async function fetchScreener(ticker: string): Promise<Fundamentals> {
  const t = ticker.toUpperCase().replace(/[^A-Z0-9&-]/g, '');
  let lastErr: unknown;
  for (const url of [`https://www.screener.in/company/${t}/consolidated/`, `https://www.screener.in/company/${t}/`]) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(20_000) });
      if (res.status === 404) { lastErr = new Error(`No screener page for ${t}`); continue; }
      if (!res.ok) throw new Error(`screener ${res.status}`);
      const f = parseScreener(await res.text(), t, url);
      if (f.quarters.length) return f;
      lastErr = new Error('empty quarterly table');
    } catch (e) { lastErr = e; }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

const num = (s: string) => {
  const c = s.replace(/[,₹%\s]/g, '').replace(/−/g, '-');
  if (!c || c === '-' || c === '--') return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
};
const label = (s: string) => s.replace(/ /g, ' ').replace(/\+$/, '').replace(/\s+/g, ' ').trim().toLowerCase();

function table($: cheerio.CheerioAPI, id: string) {
  const sec = $(`section#${id}`);
  const tbl = sec.find('table.data-table').first();
  const headers = tbl.find('thead th').map((_, th) => $(th).text().trim()).get().slice(1);
  const rows = new Map<string, (number | null)[]>();
  tbl.find('tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    const name = label($(tds[0]).text());
    if (!name) return;
    rows.set(name, tds.slice(1).map((__, td) => num($(td).text())).get() as (number | null)[]);
  });
  return { headers, rows };
}

function pick(rows: Map<string, (number | null)[]>, ...names: string[]) {
  for (const n of names) for (const [k, v] of rows) if (k === n || k.startsWith(n)) return v;
  return undefined;
}

export function parseScreener(html: string, ticker: string, url: string): Fundamentals {
  const $ = cheerio.load(html);
  const name = $('h1').first().text().trim() || ticker;
  const about = $('.company-profile .about p, .about p').first().text().trim() || undefined;
  const ratios: Record<string, number | null> = {};
  $('#top-ratios li').each((_, li) => { ratios[label($(li).find('.name').text())] = num($(li).find('.number').first().text()); });
  const bse = (/BSE:\s*(\d{6})/.exec($('.company-links, .company-info').text()) ?? /BSE:\s*(\d{6})/.exec($.text()))?.[1];

  const q = table($, 'quarters');
  const lender = !!pick(q.rows, 'financing profit') || (!pick(q.rows, 'sales') && !!pick(q.rows, 'revenue'));
  const sales = pick(q.rows, 'sales', 'revenue') ?? [];
  const op = pick(q.rows, 'operating profit') ?? [];
  const oi = pick(q.rows, 'other income') ?? [];
  const intr = pick(q.rows, 'interest') ?? [];
  const dep = pick(q.rows, 'depreciation') ?? [];
  const pbt = pick(q.rows, 'profit before tax') ?? [];
  const pat = pick(q.rows, 'net profit') ?? [];
  const quarters: Quarter[] = q.headers.map((h, i) => ({ label: h, sales: sales[i] ?? 0, ebitda: lender ? null : op[i] ?? null, otherIncome: oi[i] ?? 0, interest: intr[i] ?? 0, dep: dep[i] ?? 0, pbt: pbt[i] ?? 0, pat: pat[i] ?? 0 })).filter((x) => x.sales);

  const pl = table($, 'profit-loss');
  const yrIdx = pl.headers.map((h, i) => (/^mar|^dec|^jun|^sep/i.test(h) ? i : -1)).filter((i) => i >= 0);
  const take = (arr?: (number | null)[]) => (arr ? yrIdx.map((i) => arr[i] ?? null) : undefined);
  const bs = table($, 'balance-sheet');
  const cf = table($, 'cash-flow');
  const ra = table($, 'ratios');
  const alignTo = (t: { headers: string[] }, arr?: (number | null)[]) => {
    if (!arr) return undefined;
    return yrIdx.map((i) => { const h = pl.headers[i]; const j = t.headers.indexOf(h); return j >= 0 ? arr[j] ?? null : null; });
  };
  const eq = pick(bs.rows, 'equity capital'), res = pick(bs.rows, 'reserves');
  const annual: Annual = {
    years: yrIdx.map((i) => pl.headers[i]),
    sales: take(pick(pl.rows, 'sales', 'revenue')) ?? [],
    op: take(pick(pl.rows, 'operating profit', 'financing profit')),
    pat: take(pick(pl.rows, 'net profit')),
    cfo: alignTo(cf, pick(cf.rows, 'cash from operating')),
    fcf: alignTo(cf, pick(cf.rows, 'free cash flow')),
    cfoToOp: alignTo(cf, pick(cf.rows, 'cfo/op', 'cfo/ebitda')),
    debtorDays: alignTo(ra, pick(ra.rows, 'debtor days')),
    inventoryDays: alignTo(ra, pick(ra.rows, 'inventory days')),
    payableDays: alignTo(ra, pick(ra.rows, 'days payable')),
    ccc: alignTo(ra, pick(ra.rows, 'cash conversion cycle')),
    roce: alignTo(ra, pick(ra.rows, 'roce')),
    equity: eq && res ? alignTo(bs, eq.map((v, i) => (v ?? 0) + (res[i] ?? 0))) : undefined,
    borrowings: alignTo(bs, pick(bs.rows, 'borrowings', 'borrowing')),
  };

  const docs: Fundamentals['docs'] = [];
  $('#documents a, .documents a').each((_, a) => {
    const href = $(a).attr('href'); const text = $(a).text().replace(/\s+/g, ' ').trim();
    if (!href || !/^https?:/.test(href)) return;
    if (/transcript/i.test(text) || $(a).hasClass('concall-link') && /transcript/i.test($(a).attr('title') ?? text)) {
      const when = $(a).closest('li').find('div').first().text().replace(/\s+/g, ' ').trim();
      docs.push({ label: when || 'Transcript', url: href, kind: 'transcript' });
    } else if (/financial year/i.test(text)) docs.push({ label: text.replace(/from (bse|nse).*/i, '').trim(), url: href, kind: 'annual_report' });
  });

  return {
    ticker, name, about, bse, lender,
    price: ratios['current price'] ?? undefined, mcap: ratios['market cap'] ?? undefined, pe: ratios['stock p/e'] ?? undefined,
    roce: ratios['roce'] ?? undefined, roe: ratios['roe'] ?? undefined,
    quarters, annual, docs, source: { label: 'screener.in (standardised from company filings)', url },
  };
}
