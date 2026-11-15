'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Story } from '@/lib/triage';
import type { PricePoint, Category } from '@/lib/types';
import { usePrefs, tierFor, DEFAULT_CATS, type CatMode } from '@/lib/prefs';
import { computeAlerts } from '@/lib/alerts';
import StoryCard, { RoutineRow } from './StoryCard';
import { SectionTitle, Spark, Ticker, Initials } from './ui';
import { CATEGORY_LABEL } from '@/lib/classify';

interface Reconnect { personId: string; name: string; headline: string; ticker: string; event: string; months: string; how: string }
interface Props {
  stories: Story[]; anchor: string; stale: boolean; asOf: string; hours: number; filingsInWindow: number;
  names: Record<string, string>; reconnect: Reconnect[]; holdings: number; catchUp: { h: number; n: number }[];
}

const WINDOWS = [{ h: 24, l: '24h' }, { h: 72, l: '3 days' }, { h: 168, l: '7 days' }, { h: 720, l: '30 days' }];

export default function Digest(p: Props) {
  const [prefs, setPrefs] = usePrefs();
  const [prices, setPrices] = useState<{ prices: Record<string, PricePoint[]>; source: string } | null>(null);
  const [sheet, setSheet] = useState(false);
  useEffect(() => { fetch('/api/prices').then((r) => r.json()).then(setPrices).catch(() => setPrices({ prices: {}, source: 'unavailable' })); }, []);

  const tiered = useMemo(() => p.stories.map((s) => ({ ...s, tier: tierFor(s.score, s.category, prefs) })), [p.stories, prefs]);
  const act = tiered.filter((s) => s.tier === 'act');
  const glance = tiered.filter((s) => s.tier === 'glance');
  const routine = tiered.filter((s) => s.tier === 'routine');
  const alerts = useMemo(() => (prices ? computeAlerts(prices.prices, prefs.thresholds, 1) : []), [prices, prefs.thresholds]);
  const isDone = (id: string) => prefs.done.includes(id);
  const toggleDone = (id: string) => setPrefs((x) => ({ ...x, done: isDone(id) ? x.done.filter((d) => d !== id) : [...x.done, id] }));
  const open = act.filter((s) => !isDone(s.id));

  const date = new Date(p.anchor).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
  const winLabel = WINDOWS.find((w) => w.h === p.hours)?.l ?? `${p.hours}h`;
  const headline = open.length === 0 ? (p.hours <= 24 ? 'A quiet day. Nothing needs you.' : 'Nothing needs you.') : `${['', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things'][open.length] ?? `${open.length} things`} need${open.length === 1 ? 's' : ''} you.`;

  return (
    <main>
      <header className="px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="serif text-[22px] font-semibold tracking-tight">FINN</span>
            <span className={`size-1.5 rounded-full ${p.stale ? 'bg-glance' : 'bg-up live-dot'}`} />
          </div>
          <div className="flex items-center gap-1">
            <BriefButton stories={open.length ? open : glance.slice(0, 3)} alerts={alerts.map((a) => `${p.names[a.ticker] ?? a.ticker} ${a.text}`)} names={p.names} winLabel={winLabel} />
            <button onClick={() => setSheet(true)} className="tap size-9 grid place-items-center rounded-full text-ink-2" aria-label="What should interrupt me">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" strokeLinecap="round" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
            </button>
          </div>
        </div>
        <p className="mt-5 text-[11.5px] uppercase tracking-[0.14em] text-muted font-semibold">{date}</p>
        <h1 className="serif text-[32px] leading-[1.08] tracking-[-0.015em] mt-1">{headline}</h1>
        <p className="text-[13.5px] text-ink-2 mt-2">
          {p.filingsInWindow} filing{p.filingsInWindow === 1 ? '' : 's'} across {p.holdings} holdings in the last {winLabel}. {routine.length > 0 && <>{routine.reduce((s, r) => s + r.filings.length, 0)} routine, folded away.</>}
        </p>
        {p.stale && <p className="mt-2 text-[12px] text-glance">Showing the snapshot from {new Date(p.asOf).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })}. Live refresh runs after market close.</p>}
        <nav className="no-scrollbar mt-4 -mx-5 px-5 flex gap-2 overflow-x-auto">
          {WINDOWS.map((w) => (
            <Link key={w.h} href={w.h === 24 ? '/' : `/?w=${w.h}`} scroll={false} className={`chip tap !text-[12.5px] !px-3 !py-1.5 border ${w.h === p.hours ? 'bg-ink text-card border-ink' : 'hair text-ink-2'}`}>{w.l}</Link>
          ))}
        </nav>
      </header>

      <Moves alerts={alerts} names={p.names} source={prices?.source} loading={!prices} th={prefs.thresholds} onTune={() => setSheet(true)} />

      {act.length > 0 && <SectionTitle aside={<span className="text-[11px] text-muted">{act.length - open.length > 0 ? `${act.length - open.length} done` : ''}</span>}>Needs you</SectionTitle>}
      {act.map((s, i) => <StoryCard key={s.id} s={s} anchor={p.anchor} open={i === 0 && !isDone(s.id)} done={isDone(s.id)} onDone={() => toggleDone(s.id)} />)}

      {act.length === 0 && p.hours <= 24 && (
        <div className="mx-4 mt-6 rounded-2xl border border-dashed hair p-4">
          <p className="text-[13.5px] text-ink-2">Nothing crossed your thresholds since yesterday. Catch up instead:</p>
          <div className="mt-3 flex gap-2">
            {p.catchUp.filter((c) => c.n > 0).map((c) => (
              <Link key={c.h} href={`/?w=${c.h}`} className="tap flex-1 rounded-xl bg-ink text-card px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wider opacity-70">Last {c.h === 168 ? '7 days' : '30 days'}</div>
                <div className="serif text-[18px]">{c.n} thing{c.n > 1 ? 's' : ''} worth your time</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {glance.length > 0 && <SectionTitle>Worth a glance</SectionTitle>}
      {glance.map((s) => <StoryCard key={s.id} s={s} anchor={p.anchor} done={isDone(s.id)} onDone={() => toggleDone(s.id)} />)}

      {routine.length > 0 && (
        <details className="mx-4 mt-6 rounded-2xl bg-sunk/50 px-4 py-3 group">
          <summary className="flex items-center justify-between cursor-pointer text-[13px]">
            <span><span className="font-semibold">{routine.reduce((s, r) => s + r.filings.length, 0)} routine filing{routine.reduce((s, r) => s + r.filings.length, 0) === 1 ? '' : 's'}</span> <span className="text-muted">— {summarise(routine)}</span></span>
            <span className="text-muted group-open:rotate-180 transition">⌄</span>
          </summary>
          <ul className="mt-2">{routine.map((s) => <RoutineRow key={s.id} s={s} anchor={p.anchor} />)}</ul>
        </details>
      )}

      {p.reconnect.length > 0 && (
        <>
          <SectionTitle>Keep warm</SectionTitle>
          <div className="mx-4 space-y-2">
            {p.reconnect.map((r) => (
              <Link key={r.personId} href={`/person/${r.personId}`} className="tap flex gap-3 items-start rounded-2xl bg-net-bg p-3.5">
                <Initials name={r.name} net />
                <div className="text-[13px] leading-snug">
                  <div><span className="font-semibold text-net">{r.name}</span> <span className="text-muted">· last spoke {r.months}</span></div>
                  <div className="text-ink-2 mt-0.5">Their {r.how} is in the news: <span className="italic">{r.event}</span>. A natural reason to call.</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      <p className="text-center text-[11px] text-muted mt-8 px-8">Filings via BSE · prices via Yahoo EOD · contacts in this demo are synthetic</p>
      {sheet && <Settings prefs={prefs} setPrefs={setPrefs} onClose={() => setSheet(false)} />}
    </main>
  );
}

function summarise(rs: Story[]) {
  const c = new Map<string, number>();
  for (const r of rs) c.set(r.categoryLabel, (c.get(r.categoryLabel) ?? 0) + r.filings.length);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k.toLowerCase()} ${v}`).join(', ');
}

function Moves({ alerts, names, source, loading, th, onTune }: { alerts: ReturnType<typeof computeAlerts>; names: Record<string, string>; source?: string; loading: boolean; th: { volMultiple: number; priceMovePct: number }; onTune: () => void }) {
  return (
    <section>
      <SectionTitle aside={<button onClick={onTune} className="text-[11px] text-muted underline underline-offset-2">±{th.priceMovePct}% · {th.volMultiple}× vol</button>}>Moves</SectionTitle>
      {loading ? <div className="mx-4 h-[74px] rounded-2xl bg-sunk/60 animate-pulse" /> : alerts.length === 0 ? (
        <p className="px-5 text-[13px] text-muted">{source === 'unavailable' || source === 'none' ? 'End-of-day prices not loaded yet. They arrive with the evening refresh.' : `No holding moved more than ${th.priceMovePct}% or traded above ${th.volMultiple}× normal volume at the last close.`}</p>
      ) : (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1">
          {alerts.map((a) => (
            <Link key={a.ticker} href={`/company/${a.ticker}`} className="tap shrink-0 w-[172px] rounded-2xl border hair bg-card p-3">
              <div className="flex items-center justify-between"><Ticker t={a.ticker} href={false} /><span className={`num text-[13px] font-semibold ${a.chg >= 0 ? 'text-up' : 'text-down'}`}>{a.chg >= 0 ? '+' : '−'}{Math.abs(a.chg).toFixed(1)}%</span></div>
              <div className="mt-1.5"><Spark data={a.spark} w={146} h={28} tone={a.chg >= 0 ? 'up' : 'down'} /></div>
              <div className="mt-1 text-[11.5px] text-ink-2 leading-snug">{a.kinds.includes('volume') ? <><span className="num font-semibold">{a.volRatio.toFixed(1)}×</span> avg volume</> : names[a.ticker]}</div>
            </Link>
          ))}
        </div>
      )}
      {source && source !== 'none' && source !== 'unavailable' && <p className="px-5 mt-1 text-[10.5px] text-muted">EOD source: {source}</p>}
    </section>
  );
}

function Settings({ prefs, setPrefs, onClose }: { prefs: ReturnType<typeof usePrefs>[0]; setPrefs: ReturnType<typeof usePrefs>[1]; onClose: () => void }) {
  const cats = Object.keys(CATEGORY_LABEL) as Category[];
  const setCat = (c: Category, m: CatMode) => setPrefs((p) => ({ ...p, cats: { ...p.cats, [c]: m } }));
  const th = prefs.thresholds;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-end" onClick={onClose}>
      <div className="mx-auto w-full max-w-[480px] max-h-[86dvh] overflow-y-auto rounded-t-3xl bg-card p-5 pb-10 rise" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-4" />
        <h2 className="serif text-[24px]">What should interrupt you?</h2>
        <p className="text-[13px] text-ink-2 mt-1">You decide what “unusual” means. FINN watches every close.</p>
        <label className="block mt-5 text-[13px]">
          <div className="flex justify-between"><span>Price move in a day</span><span className="num font-semibold">±{th.priceMovePct}%</span></div>
          <input type="range" min={1} max={10} step={0.5} value={th.priceMovePct} onChange={(e) => setPrefs((p) => ({ ...p, thresholds: { ...p.thresholds, priceMovePct: +e.target.value } }))} className="w-full mt-2" />
        </label>
        <label className="block mt-4 text-[13px]">
          <div className="flex justify-between"><span>Volume vs {th.lookback}-day average</span><span className="num font-semibold">{th.volMultiple}×</span></div>
          <input type="range" min={1.2} max={5} step={0.1} value={th.volMultiple} onChange={(e) => setPrefs((p) => ({ ...p, thresholds: { ...p.thresholds, volMultiple: +e.target.value } }))} className="w-full mt-2" />
        </label>
        <h3 className="mt-6 text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">Filing types</h3>
        <ul className="mt-2 divide-y divide-line">
          {cats.map((c) => {
            const m = prefs.cats[c] ?? DEFAULT_CATS[c] ?? 'digest';
            return (
              <li key={c} className="flex items-center justify-between py-2 text-[13.5px]">
                <span>{CATEGORY_LABEL[c]}</span>
                <span className="flex rounded-full bg-sunk p-0.5 text-[11.5px]">
                  {(['alert', 'digest', 'mute'] as CatMode[]).map((x) => (
                    <button key={x} onClick={() => setCat(c, x)} className={`px-2.5 py-1 rounded-full ${m === x ? 'bg-card shadow-sm font-semibold' : 'text-muted'}`}>{x === 'alert' ? 'Alert' : x === 'digest' ? 'Digest' : 'Hide'}</button>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-ink text-card py-3 font-semibold tap">Done</button>
      </div>
    </div>
  );
}

/** "Play brief" — a 60-second spoken briefing via the browser's speech engine (zero cost, works offline). */
function BriefButton({ stories, alerts, winLabel }: { stories: Story[]; alerts: string[]; names: Record<string, string>; winLabel: string }) {
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState('');
  const queue = useRef<string[]>([]);
  const script = () => {
    const h = new Date().getHours();
    const s = [`Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'}. Here's what matters from the last ${winLabel}.`];
    if (!stories.length) s.push('Nothing crossed your thresholds.');
    stories.slice(0, 4).forEach((x, i) => {
      s.push(`${i === 0 ? 'First' : i === stories.length - 1 ? 'Finally' : 'Next'}: ${x.headline.replace(/₹/g, 'rupees ').replace(/cr\b/g, 'crore')}.`);
      if (x.take) s.push(x.take.split('. ')[0].replace(/₹/g, 'rupees ').replace(/cr\b/g, 'crore') + '.');
      const via = x.person?.paths?.[0]?.viaName ?? x.calls?.[0]?.name;
      if (via) s.push(`${via} is your best call on this.`);
    });
    if (alerts.length) s.push(`On prices: ${alerts.slice(0, 2).join('; ')}.`);
    s.push("That's all. Everything else is filed away.");
    return s;
  };
  const speak = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (playing) { synth.cancel(); setPlaying(false); setLine(''); return; }
    queue.current = script();
    const voice = synth.getVoices().find((v) => /en-IN/i.test(v.lang)) ?? synth.getVoices().find((v) => /^en/i.test(v.lang));
    const next = () => {
      const t = queue.current.shift();
      if (!t) { setPlaying(false); setLine(''); return; }
      setLine(t);
      const u = new SpeechSynthesisUtterance(t); if (voice) u.voice = voice; u.rate = 1.04; u.onend = next; synth.speak(u);
    };
    setPlaying(true); next();
  };
  return (
    <>
      <button onClick={speak} className={`tap chip !py-1.5 !px-3 border ${playing ? 'bg-ink text-card border-ink' : 'hair text-ink-2'}`} aria-label="Play spoken brief">
        {playing ? '■ Stop' : '▶ Brief'}
      </button>
      {playing && line && <div className="fixed left-0 right-0 bottom-24 z-40 px-4"><div className="mx-auto max-w-[448px] rounded-2xl bg-ink text-card px-4 py-3 text-[13.5px] finn shadow-xl rise">{line}</div></div>}
    </>
  );
}
