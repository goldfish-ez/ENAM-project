import Digest from '@/components/Digest';
import { buildStories } from '@/lib/triage';
import { getCompanies } from '@/lib/data';
import { reconnectReasons } from '@/lib/network';
import { monthsAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Today({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const sp = await searchParams;
  const hours = Math.min(720, Math.max(6, Number(sp.w) || 24));
  const { stories, anchor, stale, asOf, filingsInWindow } = buildStories(hours);
  const recent = buildStories(24 * 30).stories.map((s) => ({ ticker: s.ticker, headline: s.headline, text: s.take, score: s.score, at: s.at }));
  const catchUp = [168, 720].map((h) => ({ h, n: buildStories(h).stories.filter((s) => s.tier === 'act').length }));
  const reconnect = reconnectReasons(recent).slice(0, 3).map((r) => ({
    personId: r.person.id, name: r.person.name, headline: r.person.headline, ticker: r.ticker, event: r.headline, months: monthsAgo(r.person.rel!.lastContact), how: r.how,
  }));
  const companies = getCompanies();
  const names = Object.fromEntries(companies.map((c) => [c.ticker, c.short]));
  return <Digest stories={stories} anchor={anchor} stale={stale} asOf={asOf} hours={hours} filingsInWindow={filingsInWindow} names={names} reconnect={reconnect} holdings={companies.length} catchUp={catchUp} />;
}
