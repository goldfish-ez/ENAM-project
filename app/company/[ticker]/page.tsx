import ResearchView from '@/components/ResearchView';
import LiveResearch from '@/components/LiveResearch';
import { getResearch } from '@/lib/research';
import { SEED_FUNDAMENTALS } from '@/data/seed/research';
import { getCompany } from '@/lib/data';
import { whoToCall } from '@/lib/network';
import { buildStories } from '@/lib/triage';

export const dynamic = 'force-dynamic';

export default async function CompanyPage({ params }: { params: Promise<{ ticker: string }> }) {
  const T = decodeURIComponent((await params).ticker).toUpperCase().replace(/\.NS$/, '');
  const inPortfolio = !!getCompany(T);
  const topic = buildStories(720).stories.find((s) => s.ticker === T && /acquisition/i.test(s.take ?? ''))?.take?.match(/for the (\w+) acquisition/)?.[1];
  const calls = whoToCall(T, topic, 3).map((c) => ({ personId: c.person.id, name: c.person.name, headline: c.person.headline, kind: c.kind, reason: c.reason, caution: c.caution }));
  const stories = buildStories(720).stories.filter((s) => s.ticker === T && s.tier !== 'routine').slice(0, 4).map(({ id, headline, categoryLabel, at, tier }) => ({ id, headline, categoryLabel, at, tier }));
  if (SEED_FUNDAMENTALS[T]) {
    const initial = await getResearch(T);
    return <ResearchView initial={initial} calls={calls} stories={stories} inPortfolio={inPortfolio} />;
  }
  return <LiveResearch ticker={T} calls={calls} inPortfolio={inPortfolio} stories={stories} />;
}
