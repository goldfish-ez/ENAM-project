// Formatting helpers (safe for client + server).

export const yearsSpan = (a: number, b: number) => (a === b ? `${a}` : `${a}–${String(b).slice(2)}`);

export function cr(n: number | null | undefined, opts: { sign?: boolean } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const s = opts.sign && n > 0 ? '+' : '';
  const a = Math.abs(n);
  if (a >= 100000) return `${s}${n < 0 ? '−' : ''}₹${(a / 100000).toFixed(a >= 1000000 ? 1 : 2)} L cr`;
  if (a >= 1000) return `${s}${n < 0 ? '−' : ''}₹${Math.round(a).toLocaleString('en-IN')} cr`;
  if (a < 1) return `${s}${n < 0 ? '−' : ''}₹${(a * 100).toFixed(1)} lakh`;
  return `${s}${n < 0 ? '−' : ''}₹${a.toLocaleString('en-IN', { maximumFractionDigits: 1 })} cr`;
}

export const pct = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined || !Number.isFinite(n) ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(digits)}%`;

export const growth = (cur: number | null, prev: number | null) =>
  cur === null || prev === null || prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100;

export const bps = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(Math.round(n)).toLocaleString('en-IN')} bps`;

export function relDay(iso: string, anchor: Date) {
  const d = new Date(iso);
  const days = Math.floor((startOfDay(anchor).getTime() - startOfDay(d).getTime()) / 86400000);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  if (days <= 0) return `Today ${time}`;
  if (days === 1) return `Yesterday`;
  if (days < 7) return d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

function startOfDay(d: Date) {
  const s = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  s.setHours(0, 0, 0, 0);
  return s;
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

export function monthsAgo(iso: string, now = new Date('2026-11-14T10:00:00+05:30')) {
  const m = Math.round((now.getTime() - new Date(iso).getTime()) / (30.4 * 86400000));
  return m <= 0 ? 'this month' : m === 1 ? 'a month ago' : `${m} months ago`;
}
