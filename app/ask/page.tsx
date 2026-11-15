'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Initials } from '@/components/ui';

const SUGGEST = [
  { group: 'Research', items: [{ q: 'Did Persistent deliver on its promises?', note: 'guidance vs delivery' }, { q: 'PI Industries', note: 'what broke in Q2' }, { q: 'Dixon', note: 'cash & leverage' }, { q: 'HAVELLS', note: 'any NSE symbol, live' }] },
  { group: 'People', items: [{ q: 'Anup Bagchi', note: 'diligence before a meeting' }, { q: 'Leo Puri', note: 'second-degree reach' }] },
  { group: 'Network', items: [{ q: 'Who knows specialty chemicals?', note: 'expertise map' }, { q: 'Who should I call on Polycab?', note: 'insiders, rivals, customers' }, { q: 'rural lending', note: 'theme' }] },
];

type Res = { type: 'route'; href: string } | { type: 'people'; title: string; href?: string; people: { id: string; name: string; headline: string; reason: string }[] } | { type: 'none'; message: string };

export default function Ask() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>();
  const router = useRouter();
  const go = async (text: string) => {
    setQ(text); setBusy(true); setRes(undefined);
    try {
      const r: Res = await (await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q: text }) })).json();
      if (r.type === 'route') router.push(r.href); else setRes(r);
    } finally { setBusy(false); }
  };
  return (
    <main className="px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
      <span className="serif text-[22px] font-semibold tracking-tight">FINN</span>
      <h1 className="serif text-[30px] leading-[1.1] tracking-[-0.015em] mt-5">Ask about a company, a person or a theme.</h1>
      <p className="text-[13.5px] text-ink-2 mt-2">Research comes only from filings, annual reports and call transcripts. People come from your network.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} className="mt-5 sticky top-2 z-10">
        <div className="flex items-center gap-2 rounded-2xl border hair bg-card px-4 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,.4)] focus-within:border-ink">
          <svg viewBox="0 0 24 24" className="size-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="TITAN, “who knows Nagarro?”, Leo Puri…" className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-muted" enterKeyHint="search" />
          {busy && <span className="size-2 rounded-full bg-act live-dot" />}
        </div>
      </form>
      {res?.type === 'none' && <p className="mt-4 text-[13.5px] text-ink-2">{res.message}</p>}
      {res?.type === 'people' && (
        <section className="mt-5 rise">
          <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-net">{res.title}</h2>
          <ul className="mt-2 space-y-2">
            {res.people.map((p) => (
              <li key={p.id}><Link href={`/person/${p.id}`} className="tap flex gap-3 items-start rounded-2xl bg-net-bg p-3">
                <Initials name={p.name} net />
                <div className="text-[13px] leading-snug"><div className="font-semibold text-net">{p.name}</div><div className="text-muted">{p.headline}</div><div className="text-ink-2 mt-0.5">{p.reason}</div></div>
              </Link></li>
            ))}
          </ul>
          {res.href && <Link href={res.href} className="mt-3 inline-block chip bg-ink text-card">Open research →</Link>}
        </section>
      )}
      {!res && SUGGEST.map((g) => (
        <section key={g.group} className="mt-6">
          <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted mb-2">{g.group}</h2>
          <div className="space-y-1.5">
            {g.items.map((s) => (
              <button key={s.q} onClick={() => go(s.q)} className="tap w-full text-left flex items-baseline justify-between gap-3 rounded-xl border hair bg-card px-3.5 py-2.5">
                <span className="text-[14.5px]">{s.q}</span><span className="text-[11.5px] text-muted shrink-0">{s.note}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
