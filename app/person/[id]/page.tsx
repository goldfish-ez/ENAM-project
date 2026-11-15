import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPerson, connections, me, pathsTo, whoToCall, personTickers, daysSince, strengthWord } from '@/lib/network';
import { getCompanies } from '@/lib/data';
import { buildStories } from '@/lib/triage';
import { Initials, Dots, SectionTitle, Ticker } from '@/components/ui';
import { NetworkPaths } from '@/components/StoryCard';
import { monthsAgo, yearsSpan } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const p = getPerson((await params).id);
  if (!p || p.id === 'me') notFound();
  const first = p.name.replace(/^Dr\.\s*/, '').split(' ')[0];
  const mine = connections(me(), p).filter((c) => c.weight > 0.1);
  const paths = p.kind === 'public' ? pathsTo(p.id, 4) : [];
  const speaks = getCompanies().map((co) => ({ co, c: whoToCall(co.ticker, undefined, 8).find((x) => x.person.id === p.id) })).filter((x) => x.c);
  const tickers = new Set([...personTickers(p), ...speaks.map((s) => s.co.ticker)]);
  const stories = buildStories(720).stories.filter((s) => (tickers.has(s.ticker) || s.person?.id === p.id || (s.take ?? '').toLowerCase().includes(p.roles[0]?.orgName.toLowerCase().split(' ')[0] ?? '§')) && s.tier !== 'routine').slice(0, 4);

  const asks: string[] = [];
  for (const s of stories) {
    if (s.person?.id === p.id) continue;
    if (s.category === 'results') asks.push(`${s.company}: ${s.take?.split(';')[0].replace(/\.$/, '')}. What's really driving it, and is it one-off?`);
    else if (s.category === 'fund_raise' && /acquisition/i.test(s.take ?? '')) asks.push(`${s.company} is raising money around an acquisition. How do they integrate, and what breaks first?`);
    else if (s.category === 'management_change' && s.person) asks.push(`What is ${s.person.name} like to work with, and what changes in the first 100 days at ${s.company}?`);
    else if (s.category === 'litigation') asks.push(`How serious is ${s.company}'s case, realistically?`);
    else if (s.category === 'press_release') asks.push(`${s.company}: ${s.headline.replace(/^[^:]+: /, '')} Does this matter operationally?`);
  }
  if (p.kind === 'public') {
    const longest = p.roles.slice().sort((a, b) => ((b.to ?? 2026) - b.from) - ((a.to ?? 2026) - a.from))[0];
    const cur = p.roles.find((r) => r.to === null && r.ticker);
    if (longest && cur && longest.org !== cur.org) asks.push(`${(longest.to ?? 2026) - longest.from} years at ${longest.orgName}. Which of that playbook does ${first} bring to ${cur.orgName}, and what won't travel?`);
    const prev = p.roles.filter((r) => r.to !== null && r.senior).at(-1);
    if (prev) asks.push(`What did ${prev.orgName} look like when ${first} left in ${prev.to}? It's a read-across on how they run things.`);
  }
  const lead = stories.find((s) => s.person?.id !== p.id) ?? stories[0];
  const msg = p.kind === 'contact' && lead ? `Hi ${first}, it's been a while! Saw ${lead.headline.replace(/\s+/g, ' ')} and thought of you. Would love 20 minutes on how you read it. Coffee or a call next week?` : '';

  return (
    <main className="pb-4">
      <header className="px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <Link href="/network" className="text-[13px] text-muted">← Network</Link>
        <div className="mt-4 flex items-center gap-3.5">
          <Initials name={p.name} net={p.kind === 'contact'} size={56} />
          <div className="min-w-0">
            <h1 className="serif text-[26px] leading-tight">{p.name}</h1>
            <p className="text-[13px] text-ink-2">{p.headline}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`chip ${p.kind === 'public' ? 'bg-sunk text-ink-2' : 'net-chip'}`}>{p.kind === 'public' ? 'In the filings' : 'In your network'}</span>
          {p.rel && <span className="chip bg-sunk text-ink-2"><Dots n={p.rel.strength} /> you know them {strengthWord(p.rel.strength)}</span>}
          {p.rel && <span className={`chip ${daysSince(p.rel.lastContact) > 180 ? 'bg-act-bg text-act' : 'bg-sunk text-ink-2'}`}>last spoke {monthsAgo(p.rel.lastContact)}</span>}
        </div>
        {p.rel && <p className="text-[12.5px] text-muted mt-2">{p.rel.how}</p>}
        {msg && (
          <div className="mt-3 flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="chip bg-ink text-card tap !py-2 !px-3.5">Draft a note →</a>
            <a href={`mailto:?subject=${encodeURIComponent('Catching up')}&body=${encodeURIComponent(msg)}`} className="chip border hair text-ink-2 tap !py-2 !px-3.5">Email</a>
          </div>
        )}
      </header>

      {p.kind === 'public' && <div className="px-4"><NetworkPaths name={p.name} paths={paths.map((x) => ({ viaId: x.via?.id, viaName: x.via?.name, viaHeadline: x.via?.headline, strength: x.via?.rel?.strength, links: x.links, score: x.score, why: x.why }))} /></div>}

      {mine.length > 0 && (
        <>
          <SectionTitle>How you overlap</SectionTitle>
          <ul className="mx-4 space-y-1.5">{mine.map((c, i) => <li key={i} className="rounded-xl bg-net-bg text-net px-3 py-2 text-[13px]">{c.detail.replace('Overlapped', 'You overlapped')}</li>)}</ul>
        </>
      )}

      {asks.length > 0 && (
        <>
          <SectionTitle>Worth asking</SectionTitle>
          <ul className="mx-4 space-y-2">{asks.slice(0, 4).map((a, i) => <li key={i} className="rounded-xl border hair bg-card px-3.5 py-2.5 text-[13.5px] leading-snug finn">{a}</li>)}</ul>
        </>
      )}

      {speaks.length > 0 && (
        <>
          <SectionTitle>Can speak to your holdings</SectionTitle>
          <ul className="mx-4 rounded-2xl border hair bg-card divide-y divide-line">
            {speaks.map(({ co, c }) => (
              <li key={co.ticker} className="px-3.5 py-2.5">
                <div className="flex items-center gap-2"><Ticker t={co.ticker} /><span className="text-[11px] uppercase tracking-wider text-muted">{c!.kind === 'alumni' ? 'ex-insider' : c!.kind === 'insider-now' ? 'works there' : c!.kind}</span></div>
                <p className="text-[13px] text-ink-2 mt-1 leading-snug">{c!.reason}</p>
                {c!.caution && <p className="text-[11.5px] text-glance mt-0.5">⚠ {c!.caution}</p>}
              </li>
            ))}
          </ul>
        </>
      )}

      {stories.length > 0 && (
        <>
          <SectionTitle>In the news around them</SectionTitle>
          <ul className="mx-4 space-y-1.5">{stories.map((s) => <li key={s.id}><Link href={`/company/${s.ticker}`} className="block rounded-xl border hair bg-card px-3.5 py-2.5 text-[13px] leading-snug tap"><span className="text-[10.5px] uppercase tracking-wider font-semibold text-muted mr-1.5">{s.categoryLabel}</span>{s.headline}</Link></li>)}</ul>
        </>
      )}

      <SectionTitle>Career</SectionTitle>
      <ol className="mx-5 border-l hair pl-4 space-y-3">
        {p.roles.slice().reverse().map((r, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-ink" />
            <div className="num text-[11px] text-muted">{(r as { approx?: boolean }).approx ? 'c. ' : ''}{r.to ? yearsSpan(r.from, r.to) : `${r.from}–now`}</div>
            <div className="text-[14px] leading-snug">{r.title}</div>
            <div className="text-[12.5px] text-muted">{r.orgName}{r.ticker ? <> · <Link href={`/company/${r.ticker}`} className="underline underline-offset-2">{r.ticker}</Link></> : null}</div>
          </li>
        ))}
        {p.education.map((e, i) => (
          <li key={'e' + i} className="relative">
            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-line" />
            <div className="num text-[11px] text-muted">{yearsSpan(e.from, e.to)}</div>
            <div className="text-[14px]">{e.degree}</div>
            <div className="text-[12.5px] text-muted">{e.schoolName}</div>
          </li>
        ))}
      </ol>
      <p className="mx-5 mt-5 text-[11px] text-muted">Source: {p.provenance}{p.links?.length ? ' · ' : ''}{p.links?.map((l, i) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{i > 0 ? ', ' : ''}{l.label}</a>)}</p>
    </main>
  );
}
