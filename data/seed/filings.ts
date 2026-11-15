// Real exchange filings for the portfolio, 21 Oct – 14 Nov 2026, as listed on screener.in
// (which links each filing's BSE PDF). Exchange timestamps aren't in that listing, so
// times default to 18:30 IST. The refresh pipeline replaces this with the BSE API feed.
import type { Filing, Category, FilingFacts } from '@/lib/types';

const B = (p: string) => `https://www.bseindia.com/stockinfo/AnnPdfOpen.aspx?Pname=${p}`;
let n = 0;
const f = (ticker: string, day: string, title: string, summary: string, url: string, category?: Category, facts?: FilingFacts, time = '18:30'): Filing => ({
  id: `${ticker}-${day}-${++n}`, ticker, at: `${day}T${time}:00+05:30`, title, summary, url, category, facts, source: url.includes('bseindia') ? 'bse' : 'company',
});

export const SEED_FILINGS: Filing[] = [
  // HDFC Bank
  f('HDFCBANK', '2026-11-13', 'Change in Directorate', 'V. Srinivasa Rangan reappointed Executive Director for one year from 23 Nov 2026.', B('7b9eb8a8-fa88-453b-810f-b55034589aac.pdf'), 'management_change', { person: 'v-srinivasa-rangan', role: 'Executive Director (reappointed)', effective: '2026-11-23' }, '17:40'),
  f('HDFCBANK', '2026-11-12', 'Disclosure under Regulation 30', 'RBI approved reappointment of V. Srinivasa Rangan as Executive Director for one year from 23 Nov 2026.', B('6df1f05c-9926-47ce-9896-94c41bdb71ab.pdf'), 'management_change', { person: 'v-srinivasa-rangan', role: 'Executive Director (RBI approval)' }),
  f('HDFCBANK', '2026-11-12', 'Analyst / Investor Meet – Intimation', 'Schedule of analyst / institutional investor meetings.', B('d01ef203-cd61-4f19-b88b-7a373979e5b5.pdf'), 'investor_meetings'),
  f('HDFCBANK', '2026-11-06', 'Outcome of Postal Ballot', 'Shareholders approved Anup Bagchi as Director and MD & CEO.', B('0926e958-96d9-4537-ae2b-188dfe3eb1d1.pdf'), 'management_change', { person: 'anup-bagchi', role: 'MD & CEO', effective: '2026-10-27', note: 'Took charge 27 Oct; first CEO hired from outside the bank' }),
  f('HDFCBANK', '2026-10-31', 'Change in Management', "Sanjay D'Souza superannuated on 31 Oct 2026, ceasing as Group Head, Business Banking.", B('b36ff756-1cf7-44a3-9b2c-4583e7e0e792.pdf'), 'management_change', { personName: "Sanjay D'Souza", role: 'Group Head, Business Banking (retired)' }),

  // Persistent
  f('PERSISTENT', '2026-11-05', 'Allotment – Commercial Paper', '12,000 commercial papers worth ₹600 cr allotted on 5 Nov 2026.', B('73a8c540-4229-4137-8e2b-5aae04fa0a35.pdf'), 'fund_raise', { amountCr: 600, note: 'commercial paper' }),
  f('PERSISTENT', '2026-11-04', 'Allotment – Non-Convertible Debentures', '₹7,000 cr of NCDs allotted across six series, maturing 2028–2031.', B('258dfe1d-7ec3-4563-863f-330be44338eb.pdf'), 'fund_raise', { amountCr: 7000, note: 'NCDs, 6 series, 2028–2031' }),
  f('PERSISTENT', '2026-11-04', 'Meeting Updates', 'Committee approved allotment of ₹7,000 cr NCDs across six series.', B('8e05f8c9-956c-4fbc-9e8e-3f6aa4694621.pdf'), 'fund_raise', { amountCr: 7000 }),
  f('PERSISTENT', '2026-10-26', 'Allotment – QIP', '76.84 lakh shares allotted at ₹5,550 each, raising ₹4,264.6 cr through a QIP.', B('b633b6e5-f968-461c-b8f1-2ac155afc384.pdf'), 'fund_raise', { amountCr: 4264.6, note: 'QIP at ₹5,550' }),
  f('PERSISTENT', '2026-10-15', 'Financial Results – Q2 FY27', 'Revenue $487.6M (+7.8% QoQ, +20.0% YoY); EBIT margin 15.0%; exceptional expenses of ₹185.3 cr tied to the Nagarro acquisition.', 'https://www.persistent.com/wp-content/uploads/2026/10/press-release-q2fy27.pdf', 'results', { counterparty: 'Nagarro' }),

  // Bajaj Finance
  f('BAJFINANCE', '2026-11-11', 'Meeting Updates – QIP opened', 'QIP opened on 11 Nov 2026; floor price ₹992.25 per share.', B('4dc63132-8d0c-4836-b74b-f289525d6384.pdf'), 'fund_raise', { note: 'QIP floor ₹992.25' }),
  f('BAJFINANCE', '2026-11-10', 'Allotment – Warrants to promoter', '5.74 crore warrants allotted to Bajaj Finserv (promoter) at ₹1,010 each — ₹5,800 cr.', B('84c0dbf5-4b55-41b9-ab7b-e20d9fe359a9.pdf'), 'fund_raise', { amountCr: 5800, counterparty: 'Bajaj Finserv (promoter)' }),
  f('BAJFINANCE', '2026-11-10', 'Board Meeting Outcome – Special Committee', 'Approved issue of 5.74 crore warrants to Bajaj Finserv at ₹1,010 each, totalling ₹5,799.99 cr.', B('41e7bb57-172f-4858-a5ac-8c15fe653e81.pdf'), 'fund_raise', { amountCr: 5800 }),
  f('BAJFINANCE', '2026-11-07', 'Half-yearly report FY2026-27', 'H1 FY27: PAT up 28% to ₹12,447 cr; AUM up 26%.', B('88c1f74a-5faf-4951-bd1c-87ac9c742fd0.pdf'), 'results'),
  f('BAJFINANCE', '2026-11-05', 'Board Meeting Intimation', 'Special committee to meet 10 Nov to price warrants for preferential issue to Bajaj Finserv.', B('191d3534-ded0-412c-9b3e-a8fbe7c38d5a.pdf'), 'fund_raise'),

  // Chola
  f('CHOLAFIN', '2026-11-09', 'Notice of Postal Ballot', 'Postal ballot notice.', B('3ceef3ba-18f9-4d77-a990-fe2801500231.pdf'), 'postal_ballot'),
  f('CHOLAFIN', '2026-11-04', 'Analyst / Investor Meet – Outcome', 'Earnings call transcript filed; board approved a capital raise of up to ₹5,000 cr, subject to approvals.', B('fac6e26a-3d87-457c-9832-84a2228e0a01.pdf'), 'fund_raise', { amountCr: 5000 }),
  f('CHOLAFIN', '2026-11-03', 'Change in RTA corporate office', 'KFin Technologies changes corporate office address from 1 Dec 2026.', B('77c6f181-eccd-4c46-a7b9-c37153b074d5.pdf'), 'unclassified'),
  f('CHOLAFIN', '2026-10-29', 'Allotment of ESOP', 'Equity shares allotted on exercise of ESOPs.', B('ae42f10c-d2a1-46d3-a371-2c47ddf5f4a5.pdf'), 'unclassified'),

  // Trent
  f('TRENT', '2026-11-13', 'Reminder to dematerialise shares', 'Reminder to shareholders holding physical shares to dematerialise.', B('ce3cb1dd-0d97-4fd3-8c15-78b958145ad4.pdf'), 'unclassified', undefined, '16:05'),
  f('TRENT', '2026-11-09', 'Analyst / Investor Meet – Intimation', 'Analyst and institutional investor meetings, 17–26 Nov 2026.', B('bca602f2-cf50-4964-8641-a88186d2b914.pdf'), 'investor_meetings'),
  f('TRENT', '2026-11-06', 'Analyst / Investor Meet – Intimation', 'Goldman Sachs investor conference on 11 Nov 2026.', B('11b1a994-4cb5-4dc8-98ea-73923446674c.pdf'), 'investor_meetings'),
  f('TRENT', '2026-11-02', 'Newspaper Publication – Results', 'Newspaper publication of Q2 / H1 results (30 Sep 2026).', B('773ac0af-b53b-4ef9-9866-32dac67c2935.pdf'), 'results'),
  f('TRENT', '2026-10-29', 'Investor Presentation – Q2 FY27 results', "Investors' presentation on Q2 / H1 results.", B('5634f899-a008-45ab-b930-2b74cf08e566.pdf'), 'results'),

  // Asian Paints
  f('ASIANPAINT', '2026-11-09', 'Analyst / Investor Meet – Intimation', 'Meetings with Morgan Stanley and BlackRock in Singapore, 18–19 Nov 2026.', B('8a988798-8c55-42be-a6ce-6cb97abd6d5c.pdf'), 'investor_meetings'),
  f('ASIANPAINT', '2026-11-06', 'Change in Directorate', 'Shareholders approved Leo Puri as Independent Director; he becomes Chairman from 23 Jan 2027.', B('c6c189db-e010-4c6e-a997-b50d6d33767a.pdf'), 'management_change', { person: 'leo-puri', role: 'Chairman-designate (from 23 Jan 2027)', effective: '2027-01-23' }),
  f('ASIANPAINT', '2026-11-06', 'Outcome of Postal Ballot', 'Postal ballot results.', B('dd885c0b-f490-4da2-9fcc-a0ef6cfb76a3.pdf'), 'postal_ballot'),
  f('ASIANPAINT', '2026-11-06', "Scrutinizer's Report", "Scrutinizer's report on postal ballot.", B('ddc90afe-51c7-4e86-984c-dbb5d641c44e.pdf'), 'postal_ballot'),
  f('ASIANPAINT', '2026-11-03', 'Earnings Call Transcript', 'Transcript of the 29 Oct 2026 call on Q2 / H1 performance.', B('ee7e6efe-1f9b-4b5e-bff7-1da18902ffeb.pdf'), 'earnings_call'),

  // PI Industries
  f('PIIND', '2026-11-13', 'Analyst / Investor Meet – Intimation', 'Interaction with ICICI Prudential AMC.', B('4e5a4d73-d057-44bf-b0d9-0ba63cec02d9.pdf'), 'investor_meetings', undefined, '15:20'),
  f('PIIND', '2026-11-12', 'Earnings Call Transcript', 'Transcript of the Q2 FY27 earnings call.', B('484ab886-ee3e-47e4-b37f-df779a55297b.pdf'), 'earnings_call'),
  f('PIIND', '2026-11-06', 'Newspaper Publication – Results', 'Newspaper advertisement for unaudited results, 30 Sep 2026.', B('071ff837-a606-47f8-a266-0d5ae67adcb8.pdf'), 'results'),
  f('PIIND', '2026-11-05', 'Analyst / Investor Meet – Outcome', 'Audio recording of the 5 Nov earnings call made available.', B('3cf5f08e-3f34-42ca-b792-3542b5c5c490.pdf'), 'earnings_call'),
  f('PIIND', '2026-11-04', 'Investor Presentation – Q2 FY27 results', 'Earnings presentation for the quarter ended 30 Sep 2026.', B('d1b2efc0-65ef-4331-94b0-651af8d6c597.pdf'), 'results'),

  // Dixon
  f('DIXON', '2026-11-05', 'Allotment of ESOP', '37,750 equity shares allotted under DIXON ESOP 2020.', B('bdab8a75-541a-4c8e-bd67-a4c1e81d0a22.pdf'), 'unclassified'),
  f('DIXON', '2026-11-05', 'Earnings Call Transcript', 'Transcript of the Q2 FY27 call held 30 Oct 2026.', B('995a3a71-4a1e-4c1f-a29a-6c6747e4ca10.pdf'), 'earnings_call'),
  f('DIXON', '2026-11-03', 'Change in RTA corporate office', 'KFin Technologies shifts corporate office from 1 Dec 2026.', B('d219f169-7be4-4d16-9697-1251e8767e69.pdf'), 'unclassified'),
  f('DIXON', '2026-11-03', 'Analyst / Investor Meet – Outcome', 'One-on-one virtual meeting with DSP Mutual Fund on 2 Nov.', B('12486329-18b7-4e94-a0e6-4b851e757235.pdf'), 'investor_meetings'),
  f('DIXON', '2026-10-31', 'Newspaper Publication – Results', 'Newspaper publication of Q2 results.', B('2336e442-6dfb-4af9-81c4-09a8770d2c94.pdf'), 'results'),

  // SRF
  f('SRF', '2026-11-14', 'Disclosure under Reg. 29(2) SAST', 'Substantial-acquisition disclosure by a shareholder.', B('A2B35342_24AF_4D94_8E8E_0979CE9813BD_112402.pdf'), 'insider_trading', undefined, '11:24'),
  f('SRF', '2026-11-13', 'Disclosure under Reg. 29(2) SAST', 'Substantial-acquisition disclosure by a shareholder.', B('DE6E1DE9_DD31_442B_BC7E_2E9C215B7BAD_111502.pdf'), 'insider_trading', undefined, '11:15'),
  f('SRF', '2026-11-11', 'Disclosure under Reg. 29(2) SAST', 'Substantial-acquisition disclosure by a shareholder.', B('469C1B94_9D51_4A59_AB80_C6998F68C3FC_130826.pdf'), 'insider_trading'),
  f('SRF', '2026-11-05', 'Disclosure under Regulation 30', 'Uttarakhand tax officer imposed a ₹12.77 lakh penalty over a delivery-challan / e-way-bill mismatch.', B('55173153-1fa0-40c4-acbb-6ec58db8fc4a.pdf'), 'litigation', { amountCr: 0.1277 }),
  f('SRF', '2026-11-05', 'Change in RTA corporate office', 'KFin Technologies changes corporate office from 1 Dec 2026.', B('cc9e3b7c-587d-43e3-a940-c2550cf9f234.pdf'), 'unclassified'),

  // Polycab
  f('POLYCAB', '2026-11-06', 'Analyst / Investor Meet – Intimation', 'Analyst / investor meeting intimation.', B('72c96165-b9ed-4b62-ac86-80cc440b32ff.pdf'), 'investor_meetings'),
  f('POLYCAB', '2026-11-03', 'Allotment of ESOP', 'Shares allotted under Employee Stock Option Scheme, 2018.', B('6c644005-9bd2-42f5-b61b-556e8c885e2d.pdf'), 'unclassified'),
  f('POLYCAB', '2026-10-30', 'CIRP update', 'NCLAT allowed Polycab’s appeal and set aside the NCLT Ahmedabad order.', B('c3d1ba29-6132-47b7-9f3b-79a294e53189.pdf'), 'litigation', { direction: 'up' }),
  f('POLYCAB', '2026-10-28', 'CIRP update', 'NCLAT directed MSCI not to delist Polycab until the order is pronounced.', B('ead5c0dc-e464-4e53-8006-b861205174a9.pdf'), 'litigation'),
  f('POLYCAB', '2026-10-28', 'Analyst / Investor Meet – Intimation', 'Meeting with William Blair on 3 Nov 2026.', B('26cdd582-7e95-4019-88b5-fdff3d5e60e1.pdf'), 'investor_meetings'),

  // KPIT
  f('KPITTECH', '2026-11-12', 'Analyst / Investor Meet – Intimation', 'Avendus Spark and JM Financial conferences, Mumbai, 16 and 18 Nov.', B('df35ab63-de36-4daf-b7c4-04c5d2fba0b9.pdf'), 'investor_meetings'),
  f('KPITTECH', '2026-11-12', 'Analyst / Investor Meet – Intimation', 'Investor conferences in Mumbai, 16 and 18 Nov 2026.', B('f7320672-e51f-4047-b49e-e53cbe71a0ad.pdf'), 'investor_meetings'),
  f('KPITTECH', '2026-11-07', 'Disclosure under Reg. 29(2) SAST', 'Promoter Hemlata Shende sold shares on 4 Nov 2026.', B('703B45EC_657C_437B_B91E_78E37D0B453F_144749.pdf'), 'insider_trading', { personName: 'Hemlata Shende', role: 'Promoter', direction: 'down' }),
  f('KPITTECH', '2026-11-03', 'Earnings Call Transcript', 'Transcript of the 28 Oct 2026 call for the quarter ended 30 Sep.', B('a7331811-fe14-4c79-896d-f0a9df901335.pdf'), 'earnings_call'),
  f('KPITTECH', '2026-11-03', 'Change in RTA corporate office', 'KFin Technologies changes corporate office from 1 Dec 2026.', B('6b5ac8ab-73ab-44fe-824a-d794314fe3cd.pdf'), 'unclassified'),

  // Sun Pharma
  f('SUNPHARMA', '2026-11-05', 'Analyst / Investor Meet – Intimation', 'Analyst / investor meet notice.', B('50d58706-f181-4522-8799-b05f65780ce8.pdf'), 'investor_meetings'),
  f('SUNPHARMA', '2026-11-04', 'Earnings Call Transcript', 'Q2 FY27 earnings call transcript.', B('fe431adc-0e1a-48ee-9c2b-b6e39cba04e4.pdf'), 'earnings_call'),
  f('SUNPHARMA', '2026-11-02', 'Clarification of rumour – Reg. 30(11)', 'Company addressed a press report on a halt at its Assam plant; says the report refers to August 2026 developments.', B('1bbe06aa-8721-4e47-b0b1-985a91279ce9.pdf'), 'press_release', { note: 'exchange sought clarification on a 30 Oct news report' }),
  f('SUNPHARMA', '2026-10-31', 'Results of Postal Ballot', 'Members approved ESOP 2026, borrowing limit and related resolutions.', B('e87d46d8-c447-4fc2-9b82-a95a8a922b0f.pdf'), 'postal_ballot'),

  // L&T
  f('LT', '2026-11-09', 'Order win – Noida Metro', 'Order for a 15.1 km viaduct and 10 stations, to be completed in 36 months.', B('8269aea9-54c0-4a24-a615-6dda0ab8f054.pdf'), 'press_release'),
  f('LT', '2026-11-06', 'Analyst / Investor Meet – Intimation', 'Goldman Sachs, CITIC CLSA and JM Financial meetings, 12–17 Nov.', B('9e23e65f-ffbd-4e61-be8c-a57227966831.pdf'), 'investor_meetings'),
  f('LT', '2026-11-04', 'Change in RTA corporate office', 'KFin Technologies moves to Kokapet, Telangana from 1 Dec 2026.', B('1a1e858a-92de-4d39-9433-a8d3d62ccd22.pdf'), 'unclassified'),
  f('LT', '2026-11-02', 'Earnings Call Transcript', 'Earnings call transcript.', B('d8a69245-c1f1-4bc3-a7c9-9dbc5795aae8.pdf'), 'earnings_call'),
  f('LT', '2026-11-02', 'Order wins – Buildings', 'Residential and commercial building orders in Mumbai, Bengaluru and Hyderabad.', B('86cb66bf-7e97-4d77-a803-40ae7750d8f2.pdf'), 'press_release'),

  // Eternal
  f('ETERNAL', '2026-10-27', 'Earnings Call Transcript', 'Transcript of the 21 Oct 2026 earnings call.', B('64f36e3b-87e9-426e-be3e-515dca4525d2.pdf'), 'earnings_call'),
  f('ETERNAL', '2026-10-21', 'Monitoring Agency Report', 'ICRA: no deviation in use of QIP proceeds for the quarter ended 30 Sep 2026.', B('0c09b689-969e-4ab5-88db-ab3fa4ea814a.pdf'), 'unclassified'),
  f('ETERNAL', '2026-10-21', 'Restructuring', 'Board approved internal restructuring of the going-out business and an Adonmo–Mygate share swap.', B('a0daf632-ab45-41ef-bbc5-bfc655056cbb.pdf'), 'M&A', { counterparty: 'Adonmo / Mygate' }),
  f('ETERNAL', '2026-10-21', 'Financial Results – Q2 FY27', 'Board approved Q2 / H1 FY27 results.', B('5e5ee67c-fdd2-46d5-9390-e8e4a018c5b2.pdf'), 'results'),
  f('ETERNAL', '2026-10-21', 'Shareholders’ Letter', 'B2C NOV up 54% YoY; adjusted revenue up 76% to ₹24,621 cr; adjusted EBITDA up 197%.', B('cbfbd146-6a68-43d6-9cbc-dfb7d0f50fd0.pdf'), 'results'),

  // Titan
  f('TITAN', '2026-11-12', 'Repayment of Commercial Paper', 'Fully redeemed ₹1,000 cr commercial paper issued on 14 Aug 2026.', 'https://www.bseindia.com/stockinfo/AnnPdfOpen.aspx?Pname=77999e05-06f6-4ed6-9998-f9a775dc5c4f.pdf', 'unclassified', { amountCr: 1000 }),
  f('TITAN', '2026-11-12', 'Analyst / Investor Meet – Intimation', 'Analyst / investor meet intimation.', B('71268b4d-2f12-447d-bf1e-28310f485d17.pdf'), 'investor_meetings'),
  f('TITAN', '2026-11-11', 'Earnings Call Transcript', 'Q2 FY27 earnings call transcript.', B('daa6c172-771a-4af5-b4b3-9813fdf7536a.pdf'), 'earnings_call'),
  f('TITAN', '2026-11-09', 'Repayment of Commercial Paper', 'Fully redeemed ₹850 cr commercial paper; maturity proceeds paid 9 Nov 2026.', B('f1adda02-5720-474e-8cd2-5632e9218b7d.pdf'), 'unclassified', { amountCr: 850 }),
  f('TITAN', '2026-11-09', 'Analyst / Investor Meet – Intimation', 'Analyst / investor meet intimation.', B('ced01c36-48bf-4c4c-a74b-d17875a41c27.pdf'), 'investor_meetings'),
];
