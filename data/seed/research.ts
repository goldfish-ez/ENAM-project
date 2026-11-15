// Curated research for the demo set, so Pull works offline and instantly.
// Numbers: screener.in (standardised from filings). Guidance & quotes: Persistent's own
// call transcripts, press release and investor presentation (primary sources, linked).
// The live engine (lib/research.ts) produces the same structure for any NSE ticker.
import type { Fundamentals, Research } from '@/lib/types';
import { QUARTERS } from './companies';

const Y6 = ['Mar 2021', 'Mar 2022', 'Mar 2023', 'Mar 2024', 'Mar 2025', 'Mar 2026'];

export const SEED_FUNDAMENTALS: Record<string, Fundamentals> = {
  PERSISTENT: {
    ticker: 'PERSISTENT', name: 'Persistent Systems', bse: '533179', price: 6003, mcap: 99550, pe: 53.2, roce: 34.4, roe: 27.2,
    about: 'Software engineering and digital transformation services, with its own platforms and accelerators; partners include Salesforce and AWS.',
    quarters: QUARTERS.PERSISTENT,
    annual: { years: Y6, sales: [4188, 5711, 8351, 9822, 11939, 14748], op: [683, 958, 1519, 1676, 2058, 2796], cfo: [736, 845, 956, 1302, 1157, 1767], fcf: [611, 464, 524, 947, 964, 1572], cfoToOp: [131, 113, 85, 98, 81, 86], debtorDays: [50, 61, 69, 62, 82, 83], roce: [21, 26, 30, 29, 31, 34], equity: [2795, 3368, 3965, 4958, 6319, 7838], borrowings: [98, 578, 655, 451, 311, 477] },
    source: { label: 'screener.in', url: 'https://www.screener.in/company/PERSISTENT/consolidated/' },
  },
  DIXON: {
    ticker: 'DIXON', name: 'Dixon Technologies', bse: '540699', price: 12798, mcap: 78334, pe: 50.5, roce: 29.2, roe: 25.2,
    about: 'Electronics manufacturing services: mobile phones and EMS are about 90% of FY26 revenue; consumer electronics, home appliances and lighting make up the rest.',
    quarters: QUARTERS.DIXON,
    annual: { years: Y6, sales: [6448, 10697, 12192, 17691, 38860, 48873], op: [292, 384, 519, 705, 1515, 1873], cfo: [170, 273, 726, 584, 1150, 1782], fcf: [2, -145, 276, 16, 254, 724], cfoToOp: [77, 85, 156, 100, 94, 117], debtorDays: [62, 46, 51, 48, 65, 49], inventoryDays: [47, 43, 32, 39, 41, 31], payableDays: [108, 86, 81, 92, 111, 86], ccc: [1, 3, 2, -6, -5, -7], roce: [30, 23, 24, 29, 40, 29], equity: [738, 997, 1285, 1695, 3010, 4677] },
    source: { label: 'screener.in', url: 'https://www.screener.in/company/DIXON/consolidated/' },
  },
  TITAN: {
    ticker: 'TITAN', name: 'Titan Company', bse: '500114', price: 4367, mcap: 387696, pe: 66.4, roce: 20.5, roe: 37.7,
    about: 'Lifestyle company with leading positions in jewellery (Tanishq, CaratLane), watches and eyewear; a Tata Group–TIDCO joint venture founded in 1984.',
    quarters: QUARTERS.TITAN,
    annual: { years: Y6, sales: [21644, 28799, 40575, 51084, 60456, 87584], op: [1725, 3344, 4882, 5292, 5694, 8357], pat: [974, 2198, 3274, 3496, 3337, 5073], fcf: [4000, -940, 950, 1024, -1011, 4713], cfoToOp: [256, 2, 52, 54, 10, 88], equity: [7497, 9303, 11851, 9393, 11624, 15703], borrowings: [5638, 7275, 9367, 15528, 20777, 14551] },
    source: { label: 'screener.in', url: 'https://www.screener.in/company/TITAN/consolidated/' },
  },
  PIIND: {
    ticker: 'PIIND', name: 'PI Industries', bse: '523642', price: 1715, mcap: 26017, pe: 33.4, roce: 15.0, roe: 11.2,
    about: 'Agrochemicals: custom synthesis and manufacturing (CSM) for global innovators, plus a domestic branded agri-inputs business.',
    quarters: QUARTERS.PIIND,
    annual: { years: Y6, sales: [4577, 5300, 6492, 7666, 7978, 6714], op: [1018, 1146, 1544, 2030, 2206, 1732], cfo: [725, 529, 1501, 2036, 1413, 474], fcf: [287, 192, 1179, 1417, 575, -632], cfoToOp: [87, 61, 114, 119, 81, 48], debtorDays: [56, 60, 43, 44, 64, 88], inventoryDays: [149, 178, 144, 124, 95, 157], payableDays: [113, 115, 86, 119, 117, 125], ccc: [93, 122, 101, 49, 42, 119], roce: [22, 17, 22, 24, 23, 15], equity: [5342, 6120, 7198, 8731, 10157, 11230] },
    source: { label: 'screener.in', url: 'https://www.screener.in/company/PIIND/consolidated/' },
  },
};

const P = 'https://www.persistent.com/wp-content/uploads';

/** Hand-checked "guidance vs delivery" for Persistent — the worked example from the brief. */
export const CURATED: Partial<Record<string, Partial<Research>>> = {
  PERSISTENT: {
    business: { what: 'Mid-tier IT services firm selling software engineering and digital transformation work, with its own platforms and partners like Salesforce and AWS. In Q2 FY27 it booked costs for buying Nagarro, a European digital-engineering firm.' },
    guidance: [
      {
        promise: '$2 billion annual revenue by end of FY27',
        metric: 'Revenue (USD)',
        said: [
          { when: 'Q3 FY25 call', quote: '$2 billion by 2027 financial year end is an aspiration', who: 'Sandeep Kalra, CEO', url: `${P}/2025/01/Analyst-Call-Transcript-Q3-FY25.pdf` },
          { when: 'Q1 FY26 call', quote: 'committed to our goal of reaching 2 billion dollars by end of FY27', who: 'Management', url: `${P}/2025/07/analyst-call-transcript-q1fy26.pdf` },
          { when: 'Q2 FY26 call', quote: 'steady progress towards our aspiration of reaching $2 billion', who: 'Management', url: `${P}/2025/10/analyst-call-transcript-q2fy26.pdf` },
        ],
        delivered: [
          { label: 'Q2 FY27 revenue', value: '$487.6M', note: '+7.8% QoQ, +20.0% YoY; 26th straight quarter of growth' },
          { label: 'H1 FY27', value: '$940.0M', note: 'Q1 $452.4M + Q2 $487.6M' },
          { label: 'Needed in H2 for $2B', value: '≈$1,060M', note: '≈$530M a quarter: +8.7% QoQ average from here' },
          { label: 'Exit run-rate (Q2 × 4)', value: '$1.95B', note: 'within reach on a run-rate reading' },
        ],
        status: 'at-risk',
        verdict: 'Growth is real (20% USD YoY, matching the 19–20% CAGR they said was needed). But $2B of FY27 revenue needs H2 to accelerate. On an exit-run-rate reading it is roughly there. The "aspiration" wording leaves room for either.',
      },
      {
        promise: 'EBIT margin up 200–300 bps by FY27 (from ~14.4–14.7%)',
        metric: 'EBIT margin',
        said: [
          { when: 'Q4 FY25 call', quote: 'improving our margins by 200-300 basis points as we hit the 2 billion dollar revenue target', who: 'Management', url: `${P}/2025/04/Analyst-Call-Transcript-Q4FY25.pdf` },
          { when: 'Q2 FY26 call', quote: 'possibility of another 100 basis point we will try to improve in FY27', who: 'Vinit Teredesai, CFO', url: `${P}/2025/10/analyst-call-transcript-q2fy26.pdf` },
        ],
        delivered: [
          { label: 'Implied FY27 target', value: '≈16.6–17.7%' },
          { label: 'Q2 FY26', value: '16.3%' },
          { label: 'Q1 FY27', value: '16.0%', note: '−30 bps QoQ' },
          { label: 'Q2 FY27', value: '15.0%', note: '−130 bps YoY' },
        ],
        status: 'missed',
        verdict: 'Margins peaked at 16.3% a year ago and have gone backwards for two quarters. At 15.0% they are about 160–270 bps short of the implied target with two quarters left, and Nagarro integration costs are still ahead.',
      },
      {
        promise: 'Wage-hike hit of 180 bps, with 80–100 bps clawed back via levers',
        metric: 'EBIT margin bridge',
        said: [{ when: 'Q2 FY26 call', quote: 'anticipate an impact of 180 basis points on next quarter', who: 'Management', url: `${P}/2025/10/analyst-call-transcript-q2fy26.pdf` }],
        delivered: [{ label: 'Q2 FY26', value: '16.3%' }, { label: 'Q4 FY26', value: '16.3%', note: 'implied: Q1 FY27 call says margin fell 30 bps QoQ to 16.0%' }],
        status: 'met',
        verdict: 'The near-term bridge held. By Q4 FY26 margin was back at 16.3%, so the wage hit was absorbed. The FY27 slide is a different problem: investment and the acquisition.',
      },
    ],
    tone: [
      'On $2B, the language went from "committed to our goal" (Q1 FY26) to "our aspiration" (Q2 FY26).',
      'On margins, the CFO keeps saying "we don’t give forward-looking guidance", even as analysts quote a 16–17% target back to him (Q1 FY27).',
      'Since Q4 FY25: "growth will always be priority number one". Margin is the variable they have said they will flex.',
    ],
    narrative: {
      agree: ['Revenue growth story intact: +20.0% USD YoY in Q2 FY27, 26 straight quarters of sequential growth.', 'Order book supports it: Q2 total contract value $633.5M; trailing-12-month new-deal value (ACV) $1.96B, +17.4%.'],
      diverge: [
        'The margin promise is slipping: EBIT 15.0% vs ~16.6–17.7% implied.',
        'Q2 PAT fell 25% YoY to ₹351.5 cr on ₹185.3 cr of Nagarro acquisition costs — after two years of "margin expansion" talk.',
        'Balance sheet is changing fast: ₹4,265 cr QIP + ₹7,000 cr NCDs + ₹600 cr CP in 10 days takes it from near-zero debt to meaningful leverage.',
        'Receivable days rose from 62 (FY24) to 83 (FY26), and cash conversion slipped from 98% to 86%.',
      ],
    },
    bull: ['Best-in-class organic growth among mid-tier IT (20% USD YoY) with a $1.96B trailing new-deal value (ACV).', 'Nagarro adds European scale and digital-engineering depth, the region management wanted to grow to 15% of revenue.', 'ROCE of 34% and 26 straight growth quarters show execution.'],
    bear: ['Margins going the wrong way with integration still ahead; the 200–300 bps promise looks lost for FY27.', 'Moving from net cash to ~₹7.6k cr of debt for a large cross-border deal raises execution and interest-cost risk.', '53× P/E prices in delivery on both $2B and margins; it is currently delivering one.'],
    note: 'Curated from primary documents: company call transcripts, Q2 FY27 press release and investor presentation, plus exchange filings. Quotes are verbatim and under 20 words.',
    sources: [
      { label: 'Q2 FY27 press release', url: `${P}/2026/10/press-release-q2fy27.pdf` },
      { label: 'Q2 FY27 investor presentation', url: `${P}/2026/10/analyst-presentation-and-factsheet-q2fy27.pdf` },
      { label: 'Q1 FY27 call transcript (3 Aug 2026)', url: `${P}/2026/08/106-Transcript-of-the-investor-call-held-on-Mon-Aug-3-2026.pdf` },
      { label: 'Q2 FY26 call transcript', url: `${P}/2025/10/analyst-call-transcript-q2fy26.pdf` },
      { label: 'Q4 FY25 call transcript', url: `${P}/2025/04/Analyst-Call-Transcript-Q4FY25.pdf` },
      { label: 'QIP & NCD allotment filings (BSE)', url: 'https://www.bseindia.com/stockinfo/AnnPdfOpen.aspx?Pname=258dfe1d-7ec3-4563-863f-330be44338eb.pdf' },
    ],
  },
};
