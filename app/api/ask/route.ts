import { NextResponse } from 'next/server';
import { getCompanies } from '@/lib/data';
import { allPeople, searchPeople, whoToCall, expertiseMap } from '@/lib/network';
import { generateJson, llmEnabled } from '@/lib/llm';

// Intent router for the single Ask box. Deterministic first (instant, free); the bulk model only for leftovers.
type Out = { type: 'route'; href: string } | { type: 'people'; title: string; people: { id: string; name: string; headline: string; reason: string }[]; href?: string } | { type: 'none'; message: string };

const ALIASES: Record<string, string> = { zomato: 'ETERNAL', 'l&t': 'LT', larsen: 'LT', hdfc: 'HDFCBANK', chola: 'CHOLAFIN', 'pi ind': 'PIIND', 'sun pharma': 'SUNPHARMA', kpit: 'KPITTECH' };

function findCompany(q: string) {
  const s = q.toLowerCase();
  for (const [k, v] of Object.entries(ALIASES)) if (s.includes(k)) return v;
  for (const c of getCompanies()) if (s.includes(c.short.toLowerCase()) || s.includes(c.name.toLowerCase()) || new RegExp(`\\b${c.ticker.toLowerCase()}\\b`).test(s)) return c.ticker;
  return undefined;
}
function findPerson(q: string) {
  const s = q.toLowerCase();
  return allPeople().find((p) => p.id !== 'me' && (s.includes(p.name.toLowerCase()) || s.includes(p.name.replace(/^Dr\.\s*/, '').split(' ').slice(-1)[0].toLowerCase()) && s.includes(p.name.replace(/^Dr\.\s*/, '').split(' ')[0].toLowerCase())));
}
const THEMES = () => expertiseMap().map((e) => e.theme);

export async function POST(req: Request) {
  const { q } = (await req.json()) as { q: string };
  const s = (q ?? '').trim();
  if (!s) return NextResponse.json({ type: 'none', message: 'Type a company, a person or a theme.' } satisfies Out);
  const low = s.toLowerCase();

  const person = findPerson(s);
  if (person) return NextResponse.json({ type: 'route', href: `/person/${person.id}` } satisfies Out);

  const co = findCompany(s);
  const wantsPeople = /\b(who|anyone|someone|call|knows?|expert|talk to|speak)\b/.test(low);
  if (co && wantsPeople) {
    const calls = whoToCall(co, undefined, 5);
    return NextResponse.json({ type: 'people', title: `Who to call on ${co}`, href: `/company/${co}`, people: calls.map((c) => ({ id: c.person.id, name: c.person.name, headline: c.person.headline, reason: c.reason })) } satisfies Out);
  }
  if (co) return NextResponse.json({ type: 'route', href: `/company/${co}${/deliver|promise|guid|narrative/.test(low) ? '#guidance' : ''}` } satisfies Out);

  const theme = THEMES().find((t) => low.includes(t)) ?? THEMES().find((t) => t.split(' ').every((w) => low.includes(w.slice(0, 5))));
  if (theme || wantsPeople) {
    const ppl = searchPeople(theme ?? low.replace(/\b(who|knows?|about|anyone|in|my|network|expert|on|for|the|call|should|i)\b/g, ' ').trim());
    if (ppl.length) return NextResponse.json({ type: 'people', title: theme ? `Your go-to people on ${theme}` : `People matching “${s}”`, people: ppl.slice(0, 6).map((p) => ({ id: p.id, name: p.name, headline: p.headline, reason: (p.expertise ?? []).join(' · ') })) } satisfies Out);
  }

  // A bare symbol → research it live (works for any NSE ticker).
  const sym = /^[A-Za-z][A-Za-z0-9&-]{1,14}$/.test(s) ? s.toUpperCase() : undefined;
  if (sym) return NextResponse.json({ type: 'route', href: `/company/${sym}` } satisfies Out);

  if (llmEnabled()) {
    try {
      const { data } = await generateJson<{ kind: 'company' | 'theme' | 'person' | 'unknown'; symbol?: string; theme?: string }>('bulk',
        'Classify an investor query. Return JSON {"kind":"company|theme|person|unknown","symbol":"NSE symbol if a listed Indian company is named","theme":"sector/theme if any"}. Use NSE symbols like HAVELLS, NAUKRI, TATAMOTORS.', s, 200);
      if (data.kind === 'company' && data.symbol) return NextResponse.json({ type: 'route', href: `/company/${data.symbol.toUpperCase()}` } satisfies Out);
      if (data.theme) { const ppl = searchPeople(data.theme); if (ppl.length) return NextResponse.json({ type: 'people', title: `Your go-to people on ${data.theme}`, people: ppl.slice(0, 6).map((p) => ({ id: p.id, name: p.name, headline: p.headline, reason: (p.expertise ?? []).join(' · ') })) } satisfies Out); }
    } catch { /* fall through */ }
  }
  return NextResponse.json({ type: 'none', message: 'Try an NSE symbol (e.g. HAVELLS), a holding, a person, or a theme like “rural lending”.' } satisfies Out);
}
