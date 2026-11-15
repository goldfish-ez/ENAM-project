// BSE corporate announcements API (same endpoint the bseindia.com site uses).
import type { Filing } from './types';
import { classify } from './classify';

const H = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36',
  accept: 'application/json, text/plain, */*', origin: 'https://www.bseindia.com', referer: 'https://www.bseindia.com/',
};
const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

interface Row { NEWSID: string; NEWSSUB: string; HEADLINE: string; DT_TM: string; ATTACHMENTNAME: string; CATEGORYNAME: string | null; SUBCATNAME: string | null }

export async function fetchBseFilings(ticker: string, scrip: string, days = 30): Promise<Filing[]> {
  const to = new Date(), from = new Date(Date.now() - days * 86400_000);
  const out: Filing[] = [];
  for (let page = 1; page <= 5; page++) {
    const u = `https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=${page}&strCat=-1&subcategory=-1&strPrevDate=${ymd(from)}&strToDate=${ymd(to)}&strSearch=P&strScrip=${scrip}&strType=C`;
    const res = await fetch(u, { headers: H, signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`BSE ${scrip} ${res.status}`);
    const j = (await res.json()) as { Table: Row[]; Table1?: { ROWCNT: number }[] };
    for (const r of j.Table ?? []) {
      const subject = r.NEWSSUB.split(' - ').slice(2).join(' - ').trim() || r.NEWSSUB;
      out.push({
        id: r.NEWSID, ticker, at: `${r.DT_TM.slice(0, 19)}+05:30`, title: subject, summary: r.HEADLINE?.trim() || undefined,
        url: r.ATTACHMENTNAME ? `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${r.ATTACHMENTNAME}` : `https://www.bseindia.com/stock-share-price/x/x/${scrip}/`,
        category: classify(`${subject} ${r.SUBCATNAME ?? ''}`, r.HEADLINE ?? ''), source: 'bse',
      });
    }
    if (out.length >= (j.Table1?.[0]?.ROWCNT ?? 0) || !(j.Table ?? []).length) break;
  }
  return out;
}
