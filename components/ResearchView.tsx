'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Research, Fundamentals, GuidanceStatus } from '@/lib/types';
import type { ResearchResult } from '@/lib/research';
import type { CallLite, Story } from '@/lib/triage';
import { CallList, ResultsTable } from './StoryCard';
import { Ticker } from './ui';
import { resultsCutClient } from '@/lib/cut';

const STATUS: Record<GuidanceStatus, { label: string; cls: string }> = {
  met: { label: 'Delivered', cls: 'bg-up/12 text-up' },
  'on-track': { label: 'On track', cls: 'bg-up/12 text-up' },
  'at-risk': { label: 'At risk', cls: 'bg-glance/15 text-glance' },
  missed: { label: 'Slipping', cls: 'bg-down/12 text-down' },
  unclear: { label: 'Unclear', cls: 'bg-sunk text-muted' },
};

export default function ResearchView({ initial, calls, stories, inPortfolio }: { initial: ResearchResult; calls: CallLite[]; stories: Pick<Story, 'id' | 'headline' | 'categoryLabel' | 'at' | 'tier'>[]; inPortfolio: boolean }) {
  const [data, setData] = useState<ResearchResult>(initial);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState<string>();
  const r: Research = data.research, f: Fundamentals = data.fundamentals;
  const cut = resultsCutClient(f.quarters, f.lender);
  const cost = data.usage.reduce((s, u) => s + u.costUsd, 0), toks = data.usage.reduce((s, u) => s + u.inputTokens + u.outputTokens, 0);

  const runLive = async () => {
    setRunning(true); setErr(undefined);
    try {
      const res = await fetch(`/api/research/${r.ticker}?live=1`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'failed');
      setData(j);
    } catch (e) { setErr((e as Error).message); } finally { setRunning(false); }
  };

  return (
    <main className="pb-6">
      <header className="px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <Link href="/ask" className="text-[13px] text-muted">← Ask</Link>
        <div className="mt-3 flex items-center gap-2">
          <Ticker t={r.ticker} href={false} />
          {inPortfolio && <span className="chip bg-sunk text-ink-2">In portfolio</span>}
          <span className={`chip ${r.mode === 'live' ? 'bg-up/12 text-up' : 'bg-sunk text-muted'}`}>{r.mode === 'curated' ? 'Curated from primary docs' : r.mode === 'live' ? 'Live analysis' : 'Numbers only'}</span>
        </div>
        <h1 className="serif text-[30px] leading-[1.1] tracking-[-0.015em] mt-2">{r.name}</h1>
        {r.business?.what && <p className="text-[14px] leading-snug text-ink-2 mt-2">{r.business.what}</p>}
      </header>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
        {r.numbers.map((n) => (
          <div key={n.label} className="shrink-0 rounded-xl border hair bg-card px-3 py-2 min-w-[108px]">
            <div className="text-[10.5px] uppercase tracking-wider text-muted">{n.label}</div>
            <div className="num text-[16px] font-semibold mt-0.5">{n.value}</div>
            {n.sub && <div className={`num text-[11px] ${n.tone === 'down' ? 'text-down' : n.tone === 'up' ? 'text-up' : 'text-muted'}`}>{n.sub}</div>}
          </div>
        ))}
      </div>

      {calls.length > 0 && <div className="px-4"><CallList calls={calls} title="Before you dig in — who to call" /></div>}

      {stories.length > 0 && (
        <Section title="Recently filed">
          <ul className="space-y-1.5">{stories.map((s) => <li key={s.id} className="text-[13.5px] leading-snug"><span className={`text-[10.5px] uppercase tracking-wider font-semibold mr-1.5 ${s.tier === 'act' ? 'text-act' : 'text-muted'}`}>{s.categoryLabel}</span>{s.headline.replace(/^[^:]+: /, '')}</li>)}</ul>
        </Section>
      )}

      <Section id="guidance" title="Promised vs delivered" accent>
        {r.guidance?.length ? (
          <div className="space-y-3">
            {r.guidance.map((g, i) => (
              <div key={i} className="rounded-xl border hair bg-card p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="serif text-[17px] leading-snug">{g.promise}</h4>
                  <span className={`chip shrink-0 ${STATUS[g.status]?.cls ?? STATUS.unclear.cls}`}>{STATUS[g.status]?.label ?? g.status}</span>
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {g.said.map((s, j) => (
                    <blockquote key={j} className="text-[12.5px] leading-snug border-l-2 hair pl-2.5 text-ink-2">
                      <span className="finn">“{s.quote}”</span>
                      <span className="block text-[11px] text-muted mt-0.5">{s.who ? `${s.who} · ` : ''}{s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{s.when} ↗</a> : s.when}</span>
                    </blockquote>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {g.delivered.map((d, j) => (
                    <div key={j} className="rounded-lg bg-sunk/60 px-2.5 py-1.5">
                      <div className="text-[10.5px] text-muted leading-tight">{d.label}</div>
                      <div className="num text-[14px] font-semibold">{d.value}</div>
                      {d.note && <div className="text-[10.5px] text-muted leading-tight mt-0.5">{d.note}</div>}
                    </div>
                  ))}
                </div>
                <p className="mt-2.5 text-[13px] leading-snug">{g.verdict}</p>
              </div>
            ))}
            {r.tone && r.tone.length > 0 && (
              <div className="rounded-xl bg-sunk/50 p-3.5">
                <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-muted mb-1.5">How the language changed</div>
                <ul className="space-y-1.5 text-[13px] leading-snug text-ink-2">{r.tone.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed hair p-4 text-[13.5px] text-ink-2">
            FINN reads the last four earnings-call transcripts, pulls out every target management set, and checks each against the reported numbers.
            <button onClick={runLive} disabled={running} className="mt-3 w-full rounded-xl bg-ink text-card py-2.5 font-semibold tap disabled:opacity-60">{running ? 'Reading transcripts…' : 'Run the guidance check'}</button>
          </div>
        )}
      </Section>

      {r.narrative && (r.narrative.agree.length + r.narrative.diverge.length) > 0 && (
        <Section title="Narrative vs numbers">
          <div className="grid gap-2">
            {r.narrative.agree.map((x, i) => <Line key={'a' + i} mark="=" cls="text-up">{x}</Line>)}
            {r.narrative.diverge.map((x, i) => <Line key={'d' + i} mark="≠" cls="text-down">{x}</Line>)}
          </div>
        </Section>
      )}

      {cut && <Section title={`Latest quarter · ${cut.cur}`}><ResultsTable cut={cut} /><QuarterBars f={f} /></Section>}
      <Section title="Trajectory"><Bullets items={r.trajectory.insight} /></Section>
      <Section title="Balance sheet"><Bullets items={r.balance.insight} /></Section>
      <Section title="Cash quality"><Bullets items={r.cash.insight} /></Section>

      {(r.bull?.length || r.bear?.length) ? (
        <Section title="Bull vs bear">
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-xl bg-up/8 p-3"><div className="text-[10.5px] uppercase tracking-wider font-semibold text-up mb-1">Bull</div><Bullets items={r.bull ?? []} /></div>
            <div className="rounded-xl bg-down/8 p-3"><div className="text-[10.5px] uppercase tracking-wider font-semibold text-down mb-1">Bear</div><Bullets items={r.bear ?? []} /></div>
          </div>
        </Section>
      ) : null}

      <Section title="How this was made">
        <ul className="text-[12px] text-muted space-y-1">{data.steps.map((s, i) => <li key={i}>· {s}</li>)}</ul>
        {data.usage.length > 0 && <p className="text-[12px] text-muted mt-1.5">· {data.usage.length} model calls ({[...new Set(data.usage.map((u) => u.model))].join(', ')}), {toks.toLocaleString('en-IN')} tokens, <span className="num">${cost.toFixed(4)}</span></p>}
        {r.note && <p className="text-[12px] text-muted mt-1.5">{r.note}</p>}
        {(data.error || err) && <p className="text-[12px] text-down mt-1.5">{err ?? data.error}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">{r.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="chip border hair text-ink-2">{s.label} ↗</a>)}</div>
        {r.mode !== 'live' && <button onClick={runLive} disabled={running} className="mt-3 w-full rounded-xl border hair py-2.5 text-[13.5px] font-semibold tap disabled:opacity-60">{running ? 'Fetching filings & transcripts…' : 'Re-run live from source'}</button>}
        <p className="text-[11px] text-muted mt-2">Primary sources only: filings, annual reports, call transcripts. No news, no broker notes.</p>
      </Section>
    </main>
  );
}

function Section({ title, children, id, accent }: { title: string; children: React.ReactNode; id?: string; accent?: boolean }) {
  return (
    <section id={id} className="px-4 mt-7 scroll-mt-4">
      <h2 className={`px-1 mb-2.5 text-[11px] uppercase tracking-[0.14em] font-semibold ${accent ? 'text-act' : 'text-muted'}`}>{title}</h2>
      {children}
    </section>
  );
}
const Bullets = ({ items }: { items: string[] }) => items.length ? <ul className="space-y-1.5 px-1">{items.map((x, i) => <li key={i} className="text-[13.5px] leading-snug text-ink-2 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:size-1 before:rounded-full before:bg-muted">{x}</li>)}</ul> : <p className="text-[13px] text-muted px-1">Not enough data in the standardised tables.</p>;
const Line = ({ children, mark, cls }: { children: React.ReactNode; mark: string; cls: string }) => (
  <div className="flex gap-2.5 rounded-xl border hair bg-card px-3 py-2.5 text-[13px] leading-snug"><span className={`num font-bold ${cls}`}>{mark}</span><span className="text-ink-2">{children}</span></div>
);

function QuarterBars({ f }: { f: Fundamentals }) {
  const qs = f.quarters.slice(-8);
  const max = Math.max(...qs.map((q) => q.sales));
  return (
    <div className="mt-3 rounded-xl border hair bg-card p-3">
      <div className="flex items-end gap-1.5 h-24">
        {qs.map((q) => {
          const m = q.ebitda !== null ? (q.ebitda / q.sales) * 100 : (q.pat / q.sales) * 100;
          return (
            <div key={q.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="num text-[9.5px] text-muted mb-0.5">{m.toFixed(0)}%</span>
              <div className="w-full rounded-t bg-ink/80" style={{ height: `${(q.sales / max) * 70}%` }} />
              <span className="text-[9px] text-muted mt-1 whitespace-nowrap">{q.label.replace(/ 20/, "'")}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[10.5px] text-muted mt-1.5">Bars: revenue. Labels: {f.lender ? 'PAT' : 'EBITDA'} margin.</p>
    </div>
  );
}
