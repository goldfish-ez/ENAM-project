// Client-safe copy of the results cut (lib/triage pulls in server-only modules).
import type { Quarter } from './types';
import { growth } from './format';
import type { ResultsCut } from './triage';

export function resultsCutClient(qs: Quarter[] | undefined, lender?: boolean): ResultsCut | undefined {
  if (!qs || qs.length < 2) return undefined;
  const cur = qs[qs.length - 1], prev = qs[qs.length - 2];
  const ya = qs.find((q) => q.label === cur.label.replace(/\d{4}$/, (y) => String(+y - 1))) ?? null;
  const row = (label: string, k: keyof Quarter) => ({ label, cur: cur[k] as number | null, qoq: growth(cur[k] as number | null, prev[k] as number | null), yoy: ya ? growth(cur[k] as number | null, ya[k] as number | null) : null });
  const rows = [row(lender ? 'Total income' : 'Revenue', 'sales')];
  if (!lender) rows.push(row('EBITDA', 'ebitda'));
  rows.push(row('PBT', 'pbt'), row('PAT', 'pat'));
  const margin = !lender && cur.ebitda !== null && prev.ebitda !== null
    ? { label: 'EBITDA margin', cur: (cur.ebitda / cur.sales) * 100, prev: (prev.ebitda / prev.sales) * 100, ya: ya && ya.ebitda !== null ? (ya.ebitda / ya.sales) * 100 : null } : undefined;
  const flags: string[] = [];
  if (cur.pbt > 0 && cur.otherIncome / cur.pbt > 0.25) flags.push(`Other income is ${Math.round((cur.otherIncome / cur.pbt) * 100)}% of PBT`);
  return { cur: cur.label, prev: prev.label, ya: ya?.label ?? null, rows, margin, flags };
}
