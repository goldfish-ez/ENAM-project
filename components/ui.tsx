// Small presentational atoms shared across screens.
import Link from 'next/link';

export function Initials({ name, net = false, size = 36 }: { name: string; net?: boolean; size?: number }) {
  const ini = name.replace(/^Dr\.\s*/, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
  return (
    <span className={`inline-grid place-items-center rounded-full shrink-0 font-semibold ${net ? 'bg-net-bg text-net' : 'bg-sunk text-ink-2'}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {ini}
    </span>
  );
}

export function Dots({ n, of = 5 }: { n: number; of?: number }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`relationship ${n} of ${of}`}>
      {Array.from({ length: of }).map((_, i) => <span key={i} className={`size-[5px] rounded-full ${i < n ? 'bg-net' : 'bg-line'}`} />)}
    </span>
  );
}

export function Delta({ v, digits = 0, suffix = '%' }: { v: number | null; digits?: number; suffix?: string }) {
  if (v === null || !Number.isFinite(v)) return <span className="num text-muted">—</span>;
  const cls = v > 0.05 ? 'text-up' : v < -0.05 ? 'text-down' : 'text-muted';
  return <span className={`num ${cls}`}>{v > 0 ? '+' : v < 0 ? '−' : ''}{Math.abs(v).toFixed(digits)}{suffix}</span>;
}

export function Spark({ data, w = 84, h = 26, tone }: { data: number[]; w?: number; h?: number; tone?: 'up' | 'down' }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 2) - 1}`).join(' ');
  const c = tone ?? (data.at(-1)! >= data[0] ? 'up' : 'down');
  return <svg width={w} height={h} className={c === 'up' ? 'text-up' : 'text-down'}><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

export function Ticker({ t, href = true }: { t: string; href?: boolean }) {
  const el = <span className="num text-[11px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-sunk text-ink-2">{t}</span>;
  return href ? <Link href={`/company/${t}`}>{el}</Link> : el;
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mt-7 mb-2.5 px-5">
      <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">{children}</h2>
      {aside}
    </div>
  );
}
