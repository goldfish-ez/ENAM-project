// Network intelligence: deterministic graph reasoning over career + education histories.
// No LLM here on purpose — the reasons FINN gives must be checkable facts ("both at UTI AMC, 2013–18").
import type { Person, Connection, Path, Company, Role } from './types';
import { ALL_PEOPLE, ME } from '@/data/seed/people';
import { getCompany, getCompanies } from './data';
import { yearsSpan } from './format';

const NOW_YEAR = 2026;
const byId = new Map(ALL_PEOPLE.map((p) => [p.id, p]));

export const getPerson = (id: string) => byId.get(id);
export const allPeople = () => ALL_PEOPLE;
export const contacts = () => ALL_PEOPLE.filter((p) => p.kind === 'contact' && p.id !== 'me');
export const me = () => ME;

export function daysSince(iso: string, now = new Date('2026-11-14T10:00:00+05:30')) {
  return Math.round((now.getTime() - new Date(iso).getTime()) / 86400000);
}

const end = (r: { to: number | null }) => r.to ?? NOW_YEAR;
const approx = (r: Role) => (r as Role & { approx?: boolean }).approx === true;

/** Every factual link between two people: shared employer (overlapping years), shared school. */
export function connections(a: Person, b: Person): Connection[] {
  const out: Connection[] = [];
  for (const ra of a.roles) for (const rb of b.roles) {
    if (ra.org !== rb.org) continue;
    const from = Math.max(ra.from, rb.from), to = Math.min(end(ra), end(rb));
    const overlap = to - from;
    if (overlap < 0) continue;
    const yrs = Math.max(overlap, 0.5);
    const fuzzy = approx(ra) || approx(rb);
    const under = rb.senior && !ra.senior ? ` while ${b.name.split(' ')[0]} was ${rb.title}` : ra.senior && !rb.senior ? ` while ${a.name === 'You' ? 'you were' : a.name.split(' ')[0] + ' was'} ${ra.title}` : '';
    const weight = Math.min(1, 0.35 + 0.13 * yrs) * (fuzzy ? 0.8 : 1);
    out.push({ kind: 'worked', org: ra.org, orgName: ra.orgName, from, to, weight,
      detail: `Overlapped at ${ra.orgName}, ${fuzzy ? 'c. ' : ''}${yearsSpan(from, to)}${under}` });
  }
  for (const ea of a.education) for (const eb of b.education) {
    if (ea.school !== eb.school) continue;
    const overlap = Math.min(ea.to, eb.to) - Math.max(ea.from, eb.from);
    if (overlap > 0) out.push({ kind: 'studied', org: ea.school, orgName: ea.schoolName, from: Math.max(ea.from, eb.from), to: Math.min(ea.to, eb.to), weight: Math.min(0.85, 0.45 + 0.1 * overlap), detail: `Overlapped at ${ea.schoolName} (${Math.max(ea.from, eb.from)}–${String(Math.min(ea.to, eb.to)).slice(2)})` });
    else out.push({ kind: 'studied', org: ea.school, orgName: ea.schoolName, from: ea.from, to: eb.to, weight: 0.15, detail: `Both ${ea.schoolName} alumni (${ea.to} / ${eb.to})` });
  }
  return out.sort((x, y) => y.weight - x.weight);
}

const recency = (p: Person) => {
  if (!p.rel) return 0.5;
  const d = daysSince(p.rel.lastContact);
  return d < 60 ? 1 : d < 180 ? 0.85 : d < 365 ? 0.7 : 0.55;
};

const firstName = (p: Person) => (p.name.startsWith('Dr. ') ? p.name.split(' ')[2] : p.name.split(' ')[0]);

/** How can the investor reach `targetId`? Direct overlaps first, then one hop through a contact. */
export function pathsTo(targetId: string, limit = 4): Path[] {
  const target = byId.get(targetId);
  if (!target) return [];
  const paths: Path[] = [];
  const direct = connections(ME, target).filter((c) => c.weight > 0.3);
  if (direct.length) paths.push({ target, links: direct, score: direct[0].weight, why: `You: ${direct[0].detail.replace('Overlapped', 'overlapped')}` });
  for (const c of contacts()) {
    const links = connections(c, target).filter((l) => l.weight >= 0.3);
    if (!links.length) continue;
    const s = (c.rel!.strength / 5) * links[0].weight * recency(c);
    paths.push({ via: c, target, links, score: s,
      why: `${c.name} — ${links[0].detail.charAt(0).toLowerCase() + links[0].detail.slice(1)}. You know ${firstName(c)} ${strengthWord(c.rel!.strength)}.` });
  }
  return paths.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const strengthWord = (s: number) => ['', 'barely', 'a little', 'reasonably well', 'well', 'very well'][s];

export type CallKind = 'insider-now' | 'alumni' | 'competitor' | 'customer' | 'supplier' | 'peer' | 'expert';
export interface CallSuggestion { person: Person; kind: CallKind; reason: string; score: number; caution?: string }

/** "Who should I call?" about a company: alumni, people at rivals / customers / suppliers, theme experts. */
export function whoToCall(ticker: string, topic?: string, limit = 5): CallSuggestion[] {
  const co = getCompany(ticker);
  const out: CallSuggestion[] = [];
  for (const p of contacts()) {
    let best: CallSuggestion | undefined;
    const consider = (s: CallSuggestion) => { if (!best || s.score > best.score) best = s; };
    const warm = (p.rel!.strength / 5) * recency(p);
    for (const r of p.roles) {
      if (r.ticker === ticker) {
        if (r.to === null) consider({ person: p, kind: 'insider-now', score: 0.75 * warm,
          reason: `Works there now — ${r.title}, since ${r.from}.`,
          caution: 'Current employee: keep it to public information. No unpublished price-sensitive info (SEBI PIT).' });
        else {
          const gap = NOW_YEAR - r.to;
          consider({ person: p, kind: 'alumni', score: (gap <= 4 ? 1 : gap <= 8 ? 0.8 : 0.6) * warm,
            reason: `${r.title} at ${r.orgName}, ${yearsSpan(r.from, r.to)}. Left ${gap <= 1 ? 'recently' : gap + ' years ago'}, so still knows how it works inside.` });
        }
      }
      const rel = co?.related?.find((x) => (x.ticker && x.ticker === r.ticker) || normalize(x.name) === normalize(r.orgName));
      if (rel && r.ticker !== ticker) consider({ person: p, kind: rel.rel === 'peer' ? 'peer' : rel.rel, score: 0.62 * warm,
        reason: `${r.to ? 'Was at' : 'Sits at'} ${rel.rel === 'competitor' ? 'a competitor' : rel.rel === 'customer' ? 'a customer' : rel.rel === 'supplier' ? 'a supplier' : 'a close peer'}: ${r.title}, ${r.orgName}${r.to ? ` (${yearsSpan(r.from, r.to)})` : ''}.` });
    }
    if (topic) for (const r of p.roles) if (r.orgName.toLowerCase().includes(topic.toLowerCase())) consider({ person: p, kind: 'alumni', score: 0.95 * warm,
      reason: `${r.to ? 'Ran' : 'Runs'} ${r.title.replace(/^Head of /, '')} at ${r.orgName}${r.to ? ` (${yearsSpan(r.from, r.to)})` : ''} — the other side of this deal.` });
    const themes = [...(co?.themes ?? []), ...(topic ? [topic.toLowerCase()] : [])];
    const ex = (p.expertise ?? []).filter((e) => themes.includes(e));
    if (ex.length) consider({ person: p, kind: 'expert', score: (0.3 + 0.12 * ex.length) * warm, reason: `Go-to on ${ex.join(', ')}.` });
    if (best) out.push(best);
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '').replace(/(ltd|limited|india|industries|technologies)$/g, '');

/** Themes → people, deepest first. "Depth" = years spent in organisations tied to that theme + declared expertise. */
export function expertiseMap() {
  const map = new Map<string, { person: Person; depth: number }[]>();
  for (const p of contacts()) for (const t of p.expertise ?? []) {
    const relevantYears = p.roles.reduce((s, r) => {
      const co = r.ticker ? getCompany(r.ticker) : undefined;
      return s + (co?.themes.includes(t) ? end(r) - r.from : 0);
    }, 0);
    const arr = map.get(t) ?? [];
    arr.push({ person: p, depth: relevantYears + p.rel!.strength });
    map.set(t, arr);
  }
  return [...map.entries()].map(([theme, people]) => ({ theme, people: people.sort((a, b) => b.depth - a.depth) }))
    .sort((a, b) => b.people.length - a.people.length || a.theme.localeCompare(b.theme));
}

/** Portfolio coverage: for each holding, how close is the nearest person? Surfaces blind spots. */
export function coverage() {
  return getCompanies().map((co) => {
    const calls = whoToCall(co.ticker, undefined, 3);
    const lv = (k: CallKind) => (k === 'alumni' || k === 'insider-now' ? 3 : k === 'expert' ? 1 : 2);
    const level = calls.reduce((m, c) => Math.max(m, lv(c.kind)), 0);
    return { co, calls, level };
  });
}

export function personTickers(p: Person) {
  return [...new Set(p.roles.map((r) => r.ticker).filter(Boolean) as string[])];
}

/** People whose (former) employer is in the news → a natural reason to reconnect. */
export function reconnectReasons(events: { ticker: string; headline: string; text?: string; score: number; at: string }[]) {
  const out: { person: Person; ticker: string; headline: string; days: number; how: string; score: number }[] = [];
  for (const p of contacts()) {
    const d = daysSince(p.rel!.lastContact);
    if (d < 120) continue;
    for (const t of personTickers(p)) {
      const ev = events.filter((e) => e.ticker === t && e.score >= 45).sort((a, b) => b.score - a.score)[0];
      if (ev) { out.push({ person: p, ticker: t, headline: ev.headline, days: d, score: ev.score, how: p.roles.find((r) => r.ticker === t)!.to ? 'former employer' : 'employer' }); break; }
    }
    // Non-portfolio orgs that are in the news via a related company (e.g. Nagarro in Persistent's results)
    if (!out.find((o) => o.person.id === p.id)) for (const r of p.roles) {
      if (r.ticker) continue;
      const w = r.orgName.toLowerCase().split(' ')[0];
      const ev = events.find((e) => `${e.headline} ${e.text ?? ''}`.toLowerCase().includes(w) && e.score >= 45 && !personTickers(p).includes(e.ticker));
      if (ev) { out.push({ person: p, ticker: ev.ticker, headline: ev.headline, days: d, score: ev.score + 10, how: `old firm, ${r.orgName},` }); break; }
    }
  }
  return out.sort((a, b) => b.score - a.score || b.days - a.days);
}

export function companyForOrg(orgTicker?: string): Company | undefined { return orgTicker ? getCompany(orgTicker) : undefined; }

/** Free-text people search used by Ask ("who knows rural lending", "ex-ICICI"). */
export function searchPeople(q: string) {
  const s = q.toLowerCase();
  return contacts().map((p) => {
    let hit = 0;
    if (p.name.toLowerCase().includes(s)) hit += 3;
    for (const e of p.expertise ?? []) if (s.includes(e) || e.includes(s)) hit += 2;
    for (const r of p.roles) if (s.includes(r.orgName.toLowerCase().split(' ')[0]) || r.orgName.toLowerCase().includes(s)) hit += 1.5;
    for (const e of p.education) if (s.includes(e.schoolName.toLowerCase()) || e.schoolName.toLowerCase().includes(s)) hit += 1;
    return { p, hit };
  }).filter((x) => x.hit > 0).sort((a, b) => b.hit - a.hit).map((x) => x.p);
}
