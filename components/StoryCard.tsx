'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Story, ResultsCut, PersonCard, CallLite } from '@/lib/triage';
import { Initials, Dots, Delta, Ticker } from './ui';
import { cr, relDay } from '@/lib/format';

export function ResultsTable({ cut }: { cut: ResultsCut }) {
  return (
    <div className="mt-3 rounded-xl border hair overflow-hidden">
      <table className="w-full text-[13px]">
        <thead className="bg-sunk/60 text-[10.5px] uppercase tracking-wider text-muted">
          <tr><th className="text-left font-medium px-3 py-1.5">{cut.cur}</th><th className="text-right font-medium px-2">₹ cr</th><th className="text-right font-medium px-2">QoQ</th><th className="text-right font-medium px-3">YoY</th></tr>
        </thead>
        <tbody>
          {cut.rows.map((r) => (
            <tr key={r.label} className="border-t hair">
              <td className="px-3 py-1.5 text-ink-2">{r.label}</td>
              <td className="px-2 text-right num">{r.cur === null ? 'n/m' : r.cur.toLocaleString('en-IN')}</td>
              <td className="px-2 text-right"><Delta v={r.qoq} /></td>
              <td className="px-3 text-right"><Delta v={r.yoy} /></td>
            </tr>
          ))}
          {cut.margin && (
            <tr className="border-t hair bg-sunk/30">
              <td className="px-3 py-1.5 text-ink-2">{cut.margin.label}</td>
              <td className="px-2 text-right num">{cut.margin.cur.toFixed(1)}%</td>
              <td className="px-2 text-right"><Delta v={(cut.margin.cur - cut.margin.prev) * 100} suffix=" bp" /></td>
              <td className="px-3 text-right">{cut.margin.ya !== null ? <Delta v={(cut.margin.cur - cut.margin.ya) * 100} suffix=" bp" /> : '—'}</td>
            </tr>
          )}
        </tbody>
      </table>
      {cut.flags.length > 0 && <div className="px-3 py-2 border-t hair text-[12px] text-glance space-y-0.5">{cut.flags.map((f) => <div key={f}>⚑ {f}</div>)}</div>}
    </div>
  );
}

export function PersonBlock({ p }: { p: PersonCard }) {
  return (
    <div className="mt-3 rounded-xl border hair p-3">
      <div className="flex items-center gap-3">
        <Initials name={p.name} />
        <div className="min-w-0">
          <div className="font-semibold text-[15px] leading-tight">{p.id ? <Link href={`/person/${p.id}`} className="underline decoration-line underline-offset-2">{p.name}</Link> : p.name}</div>
          <div className="text-[12.5px] text-muted truncate">{p.role}</div>
        </div>
      </div>
      {p.career.length > 0 && (
        <ol className="mt-3 space-y-1.5 border-l hair pl-3 ml-[17px]">
          {p.career.slice(0, 4).map((c, i) => (
            <li key={i} className="text-[12.5px] leading-snug">
              <span className="num text-muted text-[11px] mr-1.5">{c.approx ? 'c.' : ''}{c.years}</span>
              <span className="text-ink-2">{c.title}</span><span className="text-muted"> · {c.org}</span>
            </li>
          ))}
        </ol>
      )}
      {p.education.length > 0 && <div className="mt-2 text-[12px] text-muted">🎓 {p.education.join(' · ')}</div>}
      <NetworkPaths paths={p.paths} name={p.name} />
    </div>
  );
}

export function NetworkPaths({ paths, name }: { paths: PersonCard['paths']; name: string }) {
  if (!paths.length) return <div className="mt-3 rounded-lg bg-net-bg/60 text-net text-[12.5px] px-3 py-2">No one in your network overlaps with {name.split(' ')[0]} yet.</div>;
  return (
    <div className="mt-3 rounded-lg bg-net-bg px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-net mb-1.5">Your way in</div>
      <ul className="space-y-2">
        {paths.map((x, i) => (
          <li key={i} className="flex gap-2.5 items-start">
            {x.viaName ? <Initials name={x.viaName} net size={26} /> : <span className="inline-grid place-items-center size-[26px] rounded-full bg-net text-card text-[10px] font-bold">YOU</span>}
            <div className="text-[12.5px] leading-snug text-ink-2">
              {x.viaId ? <Link href={`/person/${x.viaId}`} className="font-semibold text-net">{x.viaName}</Link> : <span className="font-semibold text-net">Direct</span>}
              {x.strength ? <span className="ml-2 align-middle"><Dots n={x.strength} /></span> : null}
              <div>{x.why.replace(/^[^—]*— /, '').replace(/^You: /, '')}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CallList({ calls, title = 'Who to call' }: { calls: CallLite[]; title?: string }) {
  if (!calls.length) return null;
  return (
    <div className="mt-3 rounded-lg bg-net-bg px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-net mb-1.5">{title}</div>
      <ul className="space-y-2">
        {calls.map((c) => (
          <li key={c.personId} className="flex gap-2.5 items-start">
            <Initials name={c.name} net size={26} />
            <div className="text-[12.5px] leading-snug min-w-0">
              <Link href={`/person/${c.personId}`} className="font-semibold text-net">{c.name}</Link>
              <span className="text-muted"> · {c.headline}</span>
              <div className="text-ink-2">{c.reason}</div>
              {c.caution && <div className="mt-0.5 text-[11.5px] text-glance">⚠ {c.caution}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StoryCard({ s, anchor, open: initialOpen = false, onDone, done }: { s: Story; anchor: string; open?: boolean; onDone?: () => void; done?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const rich = !!(s.results || s.person || s.calls?.length);
  return (
    <article className={`rise mx-4 mb-3 rounded-2xl border hair bg-card ${done ? 'opacity-50' : ''} ${s.tier === 'act' ? 'shadow-[0_1px_0_rgba(0,0,0,.02),0_10px_30px_-18px_rgba(0,0,0,.35)]' : ''}`}>
      <button className="w-full text-left px-4 pt-3.5 pb-3 tap" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <Ticker t={s.ticker} href={false} />
          <span className={`font-semibold uppercase tracking-wider ${s.tier === 'act' ? 'text-act' : ''}`}>{s.categoryLabel}</span>
          {s.materiality && <span className="chip bg-sunk text-ink-2 !text-[10.5px]">{s.materiality}</span>}
          <span className="ml-auto">{relDay(s.at, new Date(anchor))}</span>
        </div>
        <h3 className="serif text-[19px] leading-[1.22] mt-1.5 tracking-[-0.005em]">{s.headline}</h3>
        {s.take && <p className="text-[13.5px] leading-snug text-ink-2 mt-1.5">{s.take}</p>}
        {!open && rich && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.person?.paths?.[0] && <span className="chip net-chip">◎ {s.person.paths[0].viaName ? `via ${s.person.paths[0].viaName}` : 'you overlap directly'}</span>}
            {!s.person && s.calls?.[0] && <span className="chip net-chip">◎ {s.calls[0].name} can help</span>}
            {s.results && <span className="chip bg-sunk text-ink-2">QoQ / YoY table</span>}
          </div>
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1">
          {s.results && <ResultsTable cut={s.results} />}
          {s.person && <PersonBlock p={s.person} />}
          {s.calls && s.calls.length > 0 && <CallList calls={s.calls} title={s.person ? 'Also worth a call' : 'Who to call'} />}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Link href={`/company/${s.ticker}${s.researchHint ? '#guidance' : ''}`} className="chip bg-ink text-card tap">Open research →</Link>
            {s.filings.slice(0, 3).map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="chip border hair text-ink-2 tap" title={f.title}>Filing ↗ <span className="text-muted">{relDay(f.at, new Date(anchor))}</span></a>
            ))}
            {s.filings.length > 3 && <span className="text-[11px] text-muted">+{s.filings.length - 3} more</span>}
            {onDone && <button onClick={onDone} className="chip text-muted ml-auto tap">{done ? 'Undo' : 'Done ✓'}</button>}
          </div>
        </div>
      )}
    </article>
  );
}

export function RoutineRow({ s, anchor }: { s: Story; anchor: string }) {
  return (
    <li className="flex items-center gap-2.5 py-2 border-t hair text-[13px]">
      <Ticker t={s.ticker} href={false} />
      <span className="truncate text-ink-2">{s.headline.replace(`${s.company}: `, '')}</span>
      <a href={s.filings[0].url} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-[11px] text-muted">{relDay(s.at, new Date(anchor))} ↗</a>
    </li>
  );
}

export const money = cr;
