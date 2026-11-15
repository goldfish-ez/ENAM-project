import { NextResponse } from 'next/server';
import { getResearch } from '@/lib/research';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const live = new URL(req.url).searchParams.get('live') === '1';
  if (!/^[A-Za-z0-9&-]{1,20}$/.test(ticker)) return NextResponse.json({ error: 'Bad ticker' }, { status: 400 });
  try {
    return NextResponse.json(await getResearch(ticker, { live }));
  } catch (e) {
    return NextResponse.json({ error: `Couldn't build research for ${ticker.toUpperCase()}: ${(e as Error).message}` }, { status: 502 });
  }
}
