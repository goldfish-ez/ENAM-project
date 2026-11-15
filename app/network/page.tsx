import Link from 'next/link';
import { contacts, coverage, expertiseMap, pathsTo, reconnectReasons, daysSince } from '@/lib/network';
import { buildStories } from '@/lib/triage';
import { Initials, SectionTitle, Dots } from '@/components/ui';
import ExpertiseMap from '@/components/ExpertiseMap';
import { monthsAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function NetworkPage() {
  const people = contacts();
  const cov = coverage();
  const inside = cov.filter((c) => c.level === 3).length;
  const blind = cov.filter((c) => c.level < 2);
  const stories = buildStories(720).stories;
  const execs = stories.filter((s) => s.person?.id && s.person.paths.length).map((s) => ({ s, paths: pathsTo(s.person!.id!, 2) }));
  const reconnect = reconnectReasons(stories.map((s) => ({ ticker: s.ticker, headline: s.headline, text: s.take, score: s.score, at: s.at }))).slice(0, 4);
  const themes = expertiseMap().filter((t) => t.people.length >= 1).slice(0, 14).map((t) => ({ theme: t.theme, people: t.people.map(({ person }) => ({ id: person.id, name: person.name, headline: person.headline, strength: person.rel!.strength })) }));
  const cold = people.filter((p) => daysSince(p.rel!.lastContact) > 180).length;

  return (
    <main>
      <header className="px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <span className="serif text-[22px] font-semibold tracking-tight">FINN</span>
        <p className="mt-5 text-[11.5px] uppercase tracking-[0.14em] text-muted font-semibold">Your network</p>
        <h1 className="serif text-[30px] leading-[1.1] tracking-[-0.015em] mt-1">You know someone who has worked inside {inside} of your {cov.length} holdings.</h1>
        <p className="text-[13.5px] text-ink-2 mt-2">
          {people.length} people. {blind.length > 0 ? <>Weak spots: {blind.map((b, i) => <span key={b.co.ticker}>{i > 0 && ', '}<Link href={`/company/${b.co.ticker}`} className="font-semibold text-ink">{b.co.short}</Link></span>)} — only adjacent experts, no insiders.</> : 'No blind spots.'} {cold} people have gone quiet for 6+ months.
        </p>
      </header>

      <Orbit people={people.map((p) => ({ id: p.id, name: p.name, strength: p.rel!.strength, days: daysSince(p.rel!.lastContact), theme: p.expertise?.[0] ?? '' }))} />

      <SectionTitle>Coverage of your holdings</SectionTitle>
      <ul className="mx-4 rounded-2xl border hair bg-card divide-y divide-line">
        {cov.map(({ co, calls, level }) => { const top = calls.find((c) => (c.kind === 'alumni' || c.kind === 'insider-now' ? 3 : c.kind === 'expert' ? 1 : 2) === level) ?? calls[0]; return (
          <li key={co.ticker}><Link href={`/company/${co.ticker}`} className="flex items-center gap-3 px-3.5 py-2.5 tap">
            <span className="num text-[11px] font-semibold w-[84px] shrink-0 text-ink-2">{co.ticker}</span>
            <span className="flex gap-[3px] shrink-0">{[1, 2, 3].map((i) => <span key={i} className={`h-2.5 w-3 rounded-sm ${i <= level ? 'bg-net' : 'bg-line'}`} />)}</span>
            <span className="text-[12.5px] text-ink-2 truncate">{top ? `${top.person.name.replace(/^Dr\. /, '')} · ${top.kind === 'alumni' ? 'ex-insider' : top.kind === 'insider-now' ? 'works there' : top.kind}` : 'No one yet'}</span>
          </Link></li>
        ); })}
      </ul>
      <p className="px-5 mt-1.5 text-[11px] text-muted">■■■ worked inside · ■■ rival / customer / supplier · ■ theme expert</p>

      {execs.length > 0 && (
        <>
          <SectionTitle>Paths to people in the news</SectionTitle>
          <div className="mx-4 space-y-2.5">
            {execs.map(({ s, paths }) => (
              <Link key={s.id} href={`/person/${s.person!.id}`} className="tap block rounded-2xl border hair bg-card p-3.5">
                <div className="flex items-center gap-3">
                  <Initials name={s.person!.name} />
                  <div className="min-w-0"><div className="font-semibold text-[14.5px]">{s.person!.name}</div><div className="text-[12px] text-muted truncate">{s.person!.role} · {s.company}</div></div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
                  <span className="chip bg-sunk text-ink-2">You</span><span className="text-muted">→</span>
                  <span className="chip net-chip">{paths[0].via?.name ?? 'direct'}</span><span className="text-muted">→</span>
                  <span className="chip bg-sunk text-ink-2">{s.person!.name.split(' ')[0]}</span>
                </div>
                <p className="mt-1.5 text-[12.5px] text-ink-2 leading-snug">{paths[0].links[0].detail}.</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {reconnect.length > 0 && (
        <>
          <SectionTitle>Reasons to reconnect</SectionTitle>
          <div className="mx-4 space-y-2">
            {reconnect.map((r) => (
              <Link key={r.person.id} href={`/person/${r.person.id}`} className="tap flex gap-3 items-start rounded-2xl bg-net-bg p-3.5">
                <Initials name={r.person.name} net />
                <div className="text-[13px] leading-snug">
                  <div><span className="font-semibold text-net">{r.person.name}</span> <span className="text-muted">· {monthsAgo(r.person.rel!.lastContact)}</span></div>
                  <div className="text-ink-2 mt-0.5">Their {r.how} just made news: <span className="italic">{r.headline}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Go-to people by theme</SectionTitle>
      <ExpertiseMap themes={themes} />

      <SectionTitle>Everyone</SectionTitle>
      <ul className="mx-4 rounded-2xl border hair bg-card divide-y divide-line">
        {people.sort((a, b) => b.rel!.strength - a.rel!.strength).map((p) => (
          <li key={p.id}><Link href={`/person/${p.id}`} className="flex items-center gap-3 px-3.5 py-2.5 tap">
            <Initials name={p.name} size={30} />
            <div className="min-w-0 flex-1"><div className="text-[13.5px] font-semibold">{p.name}</div><div className="text-[12px] text-muted truncate">{p.headline}</div></div>
            <Dots n={p.rel!.strength} />
          </Link></li>
        ))}
      </ul>
      <p className="text-center text-[11px] text-muted mt-6 px-8">Contacts are synthetic for this demo. Executives come from filings and public reporting. Your network stays on your account and is never used to train models.</p>
    </main>
  );
}

/** Radial map: distance = how well you know them, fade = how long since you spoke. */
function Orbit({ people }: { people: { id: string; name: string; strength: number; days: number; theme: string }[] }) {
  const W = 360, C = W / 2;
  const sorted = people.slice().sort((a, b) => a.theme.localeCompare(b.theme));
  return (
    <div className="mx-4 mt-5 rounded-3xl border hair bg-card overflow-hidden">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full h-auto block">
        {[150, 112, 74].map((r) => <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--line)" strokeDasharray="2 4" />)}
        {sorted.map((p, i) => {
          const a = (i / sorted.length) * Math.PI * 2 - Math.PI / 2;
          const r = 168 - p.strength * 22 + (i % 3) * 9;
          const x = C + Math.cos(a) * r, y = C + Math.sin(a) * r;
          const op = p.days < 90 ? 1 : p.days < 200 ? 0.7 : 0.42;
          const ini = p.name.replace(/^Dr\.\s*/, '').split(' ').map((w) => w[0]).join('').slice(0, 2);
          return (
            <a key={p.id} href={`/person/${p.id}`}>
              <line x1={C} y1={C} x2={x} y2={y} stroke="var(--net)" strokeOpacity={0.08 + p.strength * 0.04} />
              <circle cx={x} cy={y} r={11 + p.strength} fill="var(--net-bg)" stroke="var(--net)" strokeOpacity={op} strokeWidth={1.2} opacity={op} />
              <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--net)" opacity={op} style={{ fontFamily: 'var(--font-sans)' }}>{ini}</text>
            </a>
          );
        })}
        <circle cx={C} cy={C} r={20} fill="var(--ink)" />
        <text x={C} y={C + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--card)" style={{ fontFamily: 'var(--font-sans)' }}>YOU</text>
      </svg>
      <p className="px-4 pb-3 -mt-1 text-[11px] text-muted">Closer = you know them better · faded = haven’t spoken in 6+ months</p>
    </div>
  );
}
