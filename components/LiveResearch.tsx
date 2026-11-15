'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ResearchView from './ResearchView';
import type { ResearchResult } from '@/lib/research';
import type { CallLite } from '@/lib/triage';

const STEPS = ['Fetching standardised financials from screener.in', 'Computing trajectory, leverage and cash conversion', 'Reading the last four call transcripts', 'Checking promises against reported numbers'];

export default function LiveResearch({ ticker, calls, inPortfolio, stories }: { ticker: string; calls: CallLite[]; inPortfolio: boolean; stories: Parameters<typeof ResearchView>[0]['stories'] }) {
  const [data, setData] = useState<ResearchResult>();
  const [err, setErr] = useState<string>();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 2600);
    fetch(`/api/research/${ticker}${inPortfolio ? '' : '?live=1'}`).then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); setData(j); }).catch((e) => setErr(e.message)).finally(() => clearInterval(t));
    return () => clearInterval(t);
  }, [ticker, inPortfolio]);
  if (data) return <ResearchView initial={data} calls={calls} stories={stories} inPortfolio={inPortfolio} />;
  return (
    <main className="px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
      <Link href="/ask" className="text-[13px] text-muted">← Ask</Link>
      <h1 className="serif text-[30px] mt-3">{ticker}</h1>
      {err ? (
        <div className="mt-4 rounded-2xl border hair bg-card p-4 text-[13.5px]">
          <p className="text-down">{err}</p>
          <p className="text-ink-2 mt-2">Check the NSE symbol (e.g. <span className="num">HAVELLS</span>, <span className="num">NAUKRI</span>). FINN works on any NSE company with a screener.in page.</p>
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 text-[14px] ${i <= step ? 'text-ink' : 'text-muted'}`}>
              <span className={`size-2 rounded-full ${i < step ? 'bg-up' : i === step ? 'bg-act live-dot' : 'bg-line'}`} />{s}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
