// The investor's network.
// - kind 'contact': SYNTHETIC people (fictional names and careers) standing in for the
//   investor's own network. Built to overlap realistically with the portfolio.
// - kind 'public': real executives who appear in this week's filings. Profiles come from
//   the filings and public news reporting (cited in `links`); `approx` marks years the
//   sources don't pin down.
import type { Person, Role } from '@/lib/types';

type R = Role & { approx?: boolean };
const r = (org: string, orgName: string, title: string, from: number, to: number | null, extra: Partial<R> = {}): R => ({ org, orgName, title, from, to, ...extra });

export const ME: Person = {
  id: 'me', name: 'You', kind: 'contact', headline: 'Portfolio manager, Indian equities', city: 'Mumbai',
  roles: [
    r('accenture', 'Accenture Strategy', 'Analyst', 2012, 2014),
    r('mckinsey', 'McKinsey & Company', 'Engagement Manager', 2016, 2019),
    r('kotak-ie', 'Kotak Institutional Equities', 'Analyst, Financials & IT', 2019, 2022),
    r('fund', 'Your fund', 'Portfolio Manager', 2022, null),
  ],
  education: [
    { school: 'iit-delhi', schoolName: 'IIT Delhi', degree: 'B.Tech', from: 2008, to: 2012 },
    { school: 'iim-a', schoolName: 'IIM Ahmedabad', degree: 'PGP', from: 2014, to: 2016 },
  ],
  provenance: 'Entered by you at onboarding',
};

export const PEOPLE: Person[] = [
  // ---------------- Public figures (from filings + public reporting) ----------------
  {
    id: 'anup-bagchi', name: 'Anup Bagchi', kind: 'public', headline: 'MD & CEO, HDFC Bank (from 27 Oct 2026)',
    roles: [
      r('icici-bank', 'ICICI Bank', 'Retail, corporate banking & treasury roles', 1992, 2011, { approx: true }),
      r('icici-securities', 'ICICI Securities', 'MD & CEO', 2011, 2016, { senior: true }),
      r('icici-bank', 'ICICI Bank', 'Executive Director — retail, business & rural, later wholesale banking', 2017, 2023, { senior: true }),
      r('icici-pru-life', 'ICICI Prudential Life', 'MD & CEO', 2023, 2026, { senior: true }),
      r('hdfc-bank', 'HDFC Bank', 'MD & CEO', 2026, null, { senior: true, ticker: 'HDFCBANK' }),
    ],
    education: [
      { school: 'iit-kanpur', schoolName: 'IIT Kanpur', degree: 'B.Tech', from: 1986, to: 1990 },
      { school: 'iim-b', schoolName: 'IIM Bangalore', degree: 'PGDM', from: 1990, to: 1992 },
    ],
    expertise: ['banking', 'retail lending', 'broking', 'insurance'],
    links: [
      { label: 'Business Today, 1 Oct 2026', url: 'https://www.businesstoday.in/latest/corporate/story/hdfc-bank-appoints-anup-bagchi-as-md-ceo-for-three-year-term-from-october-27-559151-2026-10-01' },
      { label: 'Outlook Business', url: 'https://www.outlookbusiness.com/corporate/why-hdfc-kotak-turned-to-icici-veterans-for-their-top-jobs' },
    ],
    provenance: 'Exchange filings + public news reporting. Education years approximate.',
  },
  {
    id: 'v-srinivasa-rangan', name: 'V. Srinivasa Rangan', kind: 'public', headline: 'Executive Director, HDFC Bank (reappointed to Nov 2027)',
    roles: [
      r('hdfc-ltd', 'HDFC Ltd', 'Executive Director & CFO', 2010, 2023, { senior: true, approx: true }),
      r('hdfc-bank', 'HDFC Bank', 'Executive Director', 2023, null, { senior: true, ticker: 'HDFCBANK' }),
    ],
    education: [],
    expertise: ['housing finance', 'treasury', 'banking'],
    provenance: 'Exchange filings. Pre-merger tenure approximate.',
  },
  {
    id: 'leo-puri', name: 'Leo Puri', kind: 'public', headline: 'Chairman-designate, Asian Paints (from 23 Jan 2027)',
    roles: [
      r('mckinsey', 'McKinsey & Company', 'Director', 1990, 2004, { approx: true, senior: true }),
      r('warburg', 'Warburg Pincus', 'Managing Director', 2004, 2008, { approx: true, senior: true }),
      r('jpmorgan', 'JPMorgan Chase', 'Chairman, South & Southeast Asia', 2008, 2013, { approx: true, senior: true }),
      r('uti-amc', 'UTI AMC', 'Managing Director', 2013, 2018, { senior: true }),
      r('apax', 'Apax Partners', 'Advisory India Chair', 2019, null, { approx: true, senior: true }),
      r('asian-paints', 'Asian Paints', 'Independent Director; Chairman from Jan 2027', 2026, null, { senior: true, ticker: 'ASIANPAINT' }),
    ],
    education: [],
    expertise: ['private equity', 'asset management', 'governance'],
    links: [
      { label: 'People Matters', url: 'https://www.peoplematters.in/news/appointments/asian-paints-appoints-former-jpmorgan-executive-leo-puri-as-chairman-51973' },
      { label: 'Outlook Business', url: 'https://www.outlookbusiness.com/corporate/meet-leo-puri-the-financial-veteran-taking-over-as-asian-paints-chairman' },
    ],
    provenance: 'Exchange filings + public news reporting. Years before 2013 approximate.',
  },

  // ---------------- Synthetic contacts (the investor's network) ----------------
  {
    id: 'rohan-mehra', name: 'Rohan Mehra', kind: 'contact', headline: 'Partner, mid-market private equity', city: 'Mumbai',
    roles: [r('icici-securities', 'ICICI Securities', 'AVP, Institutional Equities', 2012, 2017), r('kotak-ie', 'Kotak Institutional Equities', 'VP, Financials', 2017, 2020), r('pe-rohan', 'Mid-market PE fund', 'Partner', 2020, null)],
    education: [{ school: 'iim-b', schoolName: 'IIM Bangalore', degree: 'PGP', from: 2010, to: 2012 }],
    expertise: ['capital markets', 'broking', 'financials'],
    rel: { strength: 4, lastContact: '2026-09-20', how: 'Colleague at Kotak Institutional Equities', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'aditi-joshi', name: 'Aditi Joshi', kind: 'contact', headline: 'Senior Director, Wholesale Banking, ICICI Bank', city: 'Mumbai',
    roles: [r('icici-bank', 'ICICI Bank', 'Senior Director, Wholesale Banking', 2015, null)],
    education: [{ school: 'iit-delhi', schoolName: 'IIT Delhi', degree: 'B.Tech', from: 2009, to: 2013 }],
    expertise: ['banking', 'corporate lending'],
    rel: { strength: 4, lastContact: '2026-10-05', how: 'IIT Delhi — dramatics club', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'kavya-iyer', name: 'Kavya Iyer', kind: 'contact', headline: 'Head of rural products, a small finance bank', city: 'Chennai',
    roles: [r('icici-bank', 'ICICI Bank', 'Manager → AVP, Rural & Inclusive Banking', 2013, 2021), r('cholamandalam', 'Cholamandalam Finance', 'Head, Rural Home Loans', 2021, 2024, { ticker: 'CHOLAFIN' }), r('sfb-kavya', 'Small finance bank', 'Head of Rural Products', 2024, null)],
    education: [{ school: 'irma', schoolName: 'IRMA Anand', degree: 'PGDRM', from: 2011, to: 2013 }],
    expertise: ['rural lending', 'microfinance', 'vehicle finance'],
    rel: { strength: 3, lastContact: '2026-03-02', how: 'Met at a rural credit conference, 2023', channel: 'email' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'suresh-nair', name: 'Suresh Nair', kind: 'contact', headline: 'CFO, listed auto-ancillary', city: 'Chennai',
    roles: [r('ashok-leyland', 'Ashok Leyland', 'Finance roles', 1992, 2005), r('cholamandalam', 'Cholamandalam Finance', 'Head, Vehicle Finance Treasury', 2005, 2014, { ticker: 'CHOLAFIN' }), r('autoanc-suresh', 'Listed auto-ancillary', 'CFO', 2014, null)],
    education: [{ school: 'iim-b', schoolName: 'IIM Bangalore', degree: 'PGDM', from: 1990, to: 1992 }],
    expertise: ['vehicle finance', 'auto', 'treasury'],
    rel: { strength: 2, lastContact: '2025-12-10', how: 'Introduced by Rohan Mehra at an AGM', channel: 'met' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'pooja-shah', name: 'Pooja Shah', kind: 'contact', headline: 'Treasurer, a general insurer', city: 'Mumbai',
    roles: [r('hdfc-ltd', 'HDFC Ltd', 'Manager → DGM, Finance & Treasury', 2011, 2019), r('hdfc-life', 'HDFC Life', 'Head of ALM', 2019, 2023), r('insurer-pooja', 'General insurer', 'Treasurer', 2023, null)],
    education: [{ school: 'nmims', schoolName: 'NMIMS Mumbai', degree: 'MBA (Finance)', from: 2009, to: 2011 }],
    expertise: ['housing finance', 'treasury', 'insurance'],
    rel: { strength: 3, lastContact: '2026-07-15', how: 'Mumbai CFA Society panels', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'ananya-bose', name: 'Ananya Bose', kind: 'contact', headline: 'Founder, PMS; ex-UTI fund manager', city: 'Kolkata',
    roles: [r('uti-amc', 'UTI AMC', 'Fund Manager, Mid-cap Equity', 2012, 2019), r('pms-ananya', 'Own PMS', 'Founder & CIO', 2019, null)],
    education: [{ school: 'iim-c', schoolName: 'IIM Calcutta', degree: 'PGDM', from: 2008, to: 2010 }],
    expertise: ['asset management', 'consumer', 'mid-caps'],
    rel: { strength: 4, lastContact: '2026-10-30', how: 'Fund-manager breakfast group', channel: 'met' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'vikram-sethi', name: 'Vikram Sethi', kind: 'contact', headline: 'Principal, Apax Partners India', city: 'Mumbai',
    roles: [r('mckinsey', 'McKinsey & Company', 'Associate → EM', 2015, 2021), r('apax', 'Apax Partners', 'Principal', 2021, null)],
    education: [{ school: 'iit-delhi', schoolName: 'IIT Delhi', degree: 'B.Tech', from: 2009, to: 2013 }],
    expertise: ['private equity', 'consumer', 'healthcare'],
    rel: { strength: 5, lastContact: '2026-11-01', how: 'IIT Delhi, then McKinsey together', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'nikhil-rao', name: 'Nikhil Rao', kind: 'contact', headline: 'Senior GM, Sourcing, Asian Paints', city: 'Mumbai',
    roles: [r('asian-paints', 'Asian Paints', 'Senior GM, Sourcing', 2014, null, { ticker: 'ASIANPAINT' })],
    education: [{ school: 'iit-delhi', schoolName: 'IIT Delhi', degree: 'B.Tech (Chemical)', from: 2008, to: 2012 }],
    expertise: ['paints', 'chemicals sourcing', 'consumer'],
    rel: { strength: 4, lastContact: '2026-08-09', how: 'IIT Delhi batchmate, same hostel', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'arjun-malhotra', name: 'Arjun Malhotra', kind: 'contact', headline: 'CTO, Series-B SaaS startup; ex-Nagarro', city: 'Gurugram',
    roles: [r('nagarro', 'Nagarro', 'Head of Engineering Delivery, Europe accounts', 2014, 2022), r('saas-arjun', 'Series-B SaaS startup', 'CTO', 2022, null)],
    education: [{ school: 'nit-kkr', schoolName: 'NIT Kurukshetra', degree: 'B.Tech', from: 2004, to: 2008 }],
    expertise: ['it services', 'digital engineering', 'nagarro'],
    rel: { strength: 3, lastContact: '2026-02-10', how: 'Tech diligence adviser on a 2021 deal', channel: 'email' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'priya-deshpande', name: 'Priya Deshpande', kind: 'contact', headline: 'VP Strategy, KPIT Technologies', city: 'Pune',
    roles: [r('persistent', 'Persistent Systems', 'Manager → Director, Strategy & M&A', 2012, 2019, { ticker: 'PERSISTENT' }), r('kpit', 'KPIT Technologies', 'VP Strategy', 2019, null, { ticker: 'KPITTECH' })],
    education: [{ school: 'coep', schoolName: 'COEP Pune', degree: 'B.E.', from: 2006, to: 2010 }, { school: 'isb', schoolName: 'ISB', degree: 'PGP', from: 2011, to: 2012 }],
    expertise: ['it services', 'm&a integration', 'automotive software'],
    rel: { strength: 4, lastContact: '2026-08-25', how: 'ISB alumni event, Pune', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'amit-khanna', name: 'Amit Khanna', kind: 'contact', headline: 'PM, US long-only fund (India desk)', city: 'Singapore',
    roles: [r('kotak-ie', 'Kotak Institutional Equities', 'Associate, IT services', 2018, 2022), r('lo-amit', 'US long-only fund', 'Portfolio Manager', 2022, null)],
    education: [{ school: 'srcc', schoolName: 'SRCC Delhi', degree: 'B.Com', from: 2011, to: 2014 }],
    expertise: ['it services', 'financials'],
    rel: { strength: 4, lastContact: '2026-11-03', how: 'Colleague at Kotak Institutional Equities', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'sanjay-kulkarni', name: 'Dr. Sanjay Kulkarni', kind: 'contact', headline: 'Head of Process R&D, SRF Fluorochemicals', city: 'Gurugram',
    roles: [r('pi-industries', 'PI Industries', 'Senior Scientist → Head, CSM Process Chemistry', 2010, 2019, { ticker: 'PIIND' }), r('srf', 'SRF', 'Head of Process R&D, Fluorochemicals', 2019, null, { ticker: 'SRF' })],
    education: [{ school: 'ict-mumbai', schoolName: 'ICT Mumbai', degree: 'PhD, Chemical Engineering', from: 2005, to: 2010 }],
    expertise: ['specialty chemicals', 'agrochemicals', 'fluorochemicals'],
    rel: { strength: 3, lastContact: '2025-12-20', how: 'SRF Dahej plant visit, 2024', channel: 'met' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'meenal-rao', name: 'Meenal Rao', kind: 'contact', headline: 'Partner, agri-inputs consultancy', city: 'Hyderabad',
    roles: [r('pi-industries', 'PI Industries', 'Business Development, CSM exports', 2014, 2021, { ticker: 'PIIND' }), r('upl', 'UPL', 'Director, Global Sourcing', 2021, 2023), r('consult-meenal', 'Agri-inputs consultancy', 'Partner', 2023, null)],
    education: [{ school: 'iim-l', schoolName: 'IIM Lucknow', degree: 'PGP-ABM', from: 2012, to: 2014 }],
    expertise: ['agrochemicals', 'specialty chemicals', 'exports'],
    rel: { strength: 2, lastContact: '2026-04-04', how: 'Expert call, 2025', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'rahul-gupta', name: 'Rahul Gupta', kind: 'contact', headline: 'COO, Kaynes Technology; ex-Dixon', city: 'Noida',
    roles: [r('dixon', 'Dixon Technologies', 'GM → VP Operations, Mobiles', 2016, 2022, { ticker: 'DIXON' }), r('kaynes', 'Kaynes Technology', 'COO', 2022, null)],
    education: [{ school: 'iit-roorkee', schoolName: 'IIT Roorkee', degree: 'B.Tech', from: 2005, to: 2009 }],
    expertise: ['electronics manufacturing', 'ems', 'pli'],
    rel: { strength: 3, lastContact: '2026-06-11', how: 'EMS industry roundtable', channel: 'met' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'neha-joshi', name: 'Neha Joshi', kind: 'contact', headline: 'Partner, insolvency & restructuring, law firm', city: 'Mumbai',
    roles: [r('law-neha', 'Tier-1 law firm', 'Partner, Insolvency & Restructuring', 2012, null)],
    education: [{ school: 'nlsiu', schoolName: 'NLSIU Bengaluru', degree: 'BA LLB', from: 2007, to: 2012 }],
    expertise: ['insolvency', 'litigation', 'nclt'],
    rel: { strength: 3, lastContact: '2026-05-18', how: 'Counsel on a past distressed position', channel: 'email' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'karthik-subramanian', name: 'Karthik Subramanian', kind: 'contact', headline: 'Founder, rural-credit fintech; ex-Chola', city: 'Chennai',
    roles: [r('cholamandalam', 'Cholamandalam Finance', 'Regional Head, Vehicle Finance', 2009, 2020, { ticker: 'CHOLAFIN' }), r('fintech-karthik', 'Rural-credit fintech', 'Founder', 2020, null)],
    education: [{ school: 'xlri', schoolName: 'XLRI', degree: 'PGDM', from: 2007, to: 2009 }],
    expertise: ['vehicle finance', 'rural lending'],
    rel: { strength: 4, lastContact: '2026-09-02', how: 'Expert network, Kotak days', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'deepak-verma', name: 'Deepak Verma', kind: 'contact', headline: 'Chief Risk Officer, mid-size NBFC', city: 'Pune',
    roles: [r('bajaj-finance', 'Bajaj Finance', 'Risk, Consumer Durables Lending', 2012, 2019, { ticker: 'BAJFINANCE' }), r('nbfc-deepak', 'Mid-size NBFC', 'Chief Risk Officer', 2019, null)],
    education: [{ school: 'iim-i', schoolName: 'IIM Indore', degree: 'PGP', from: 2010, to: 2012 }],
    expertise: ['consumer lending', 'credit risk', 'nbfc'],
    rel: { strength: 3, lastContact: '2026-05-02', how: 'Expert network, Kotak days', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'farah-khan', name: 'Dr. Farah Khan', kind: 'contact', headline: 'Pharma quality consultant; ex-Sun Pharma QA', city: 'Vadodara',
    roles: [r('sun-pharma', 'Sun Pharma', 'Senior Manager, Quality Assurance', 2012, 2020, { ticker: 'SUNPHARMA' }), r('cipla', 'Cipla', 'Head, Site Quality', 2020, 2023), r('consult-farah', 'Independent consultant', 'USFDA remediation', 2023, null)],
    education: [{ school: 'jamia-hamdard', schoolName: 'Jamia Hamdard', degree: 'M.Pharm', from: 2008, to: 2010 }],
    expertise: ['pharma', 'usfda', 'plant quality'],
    rel: { strength: 2, lastContact: '2026-01-22', how: 'Expert call on USFDA observations', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'sneha-kapoor', name: 'Sneha Kapoor', kind: 'contact', headline: 'Healthcare analyst, domestic mutual fund', city: 'Mumbai',
    roles: [r('kotak-ie', 'Kotak Institutional Equities', 'Analyst, Pharma', 2018, 2023), r('mf-sneha', 'Domestic mutual fund', 'Healthcare analyst', 2023, null)],
    education: [{ school: 'iit-bombay', schoolName: 'IIT Bombay', degree: 'B.Tech', from: 2010, to: 2014 }],
    expertise: ['pharma', 'usfda', 'healthcare'],
    rel: { strength: 4, lastContact: '2026-09-15', how: 'Colleague at Kotak Institutional Equities', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'manish-agarwal', name: 'Manish Agarwal', kind: 'contact', headline: 'Project Director (metro rail), Tata Projects; ex-L&T', city: 'Delhi',
    roles: [r('lt', 'Larsen & Toubro', 'Project Manager → Cluster Head, Metros', 2008, 2019, { ticker: 'LT' }), r('tata-projects', 'Tata Projects', 'Project Director, Metro Rail', 2019, null)],
    education: [{ school: 'iit-delhi', schoolName: 'IIT Delhi', degree: 'B.Tech (Civil)', from: 2004, to: 2008 }],
    expertise: ['infrastructure', 'metro rail', 'epc'],
    rel: { strength: 2, lastContact: '2025-10-05', how: 'IIT Delhi alumni chapter, Delhi', channel: 'met' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'shreya-menon', name: 'Shreya Menon', kind: 'contact', headline: 'Head of Category, Zudio (Trent)', city: 'Mumbai',
    roles: [r('titan', 'Titan (Tanishq)', 'Category Manager, Studded Jewellery', 2016, 2020, { ticker: 'TITAN' }), r('trent', 'Trent (Zudio)', 'Head of Category', 2020, null, { ticker: 'TRENT' })],
    education: [{ school: 'iim-a', schoolName: 'IIM Ahmedabad', degree: 'PGP', from: 2014, to: 2016 }],
    expertise: ['retail', 'jewellery', 'fashion', 'consumer'],
    rel: { strength: 5, lastContact: '2026-10-12', how: 'IIM Ahmedabad batchmate', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'kunal-bhatia', name: 'Kunal Bhatia', kind: 'contact', headline: 'Founder, D2C snacks brand; ex-Blinkit', city: 'Gurugram',
    roles: [r('zomato', 'Zomato / Blinkit', 'Dark-store supply chain lead', 2019, 2023, { ticker: 'ETERNAL' }), r('d2c-kunal', 'D2C snacks brand', 'Founder', 2023, null)],
    education: [{ school: 'iit-delhi', schoolName: 'IIT Delhi', degree: 'B.Tech', from: 2010, to: 2014 }],
    expertise: ['quick commerce', 'consumer internet', 'logistics'],
    rel: { strength: 3, lastContact: '2026-06-28', how: 'IIT Delhi hostel junior', channel: 'whatsapp' },
    provenance: 'Synthetic profile (demo)',
  },
  {
    id: 'vivek-iyer', name: 'Vivek Iyer', kind: 'contact', headline: 'Head of Channel Sales, Havells; ex-Polycab', city: 'Mumbai',
    roles: [r('polycab', 'Polycab India', 'Zonal → National Head, Channel Sales', 2011, 2021, { ticker: 'POLYCAB' }), r('havells', 'Havells', 'Head of Channel Sales, Cables', 2021, null)],
    education: [{ school: 'symbiosis', schoolName: 'Symbiosis Pune', degree: 'MBA', from: 2006, to: 2008 }],
    expertise: ['electricals', 'cables', 'distribution'],
    rel: { strength: 2, lastContact: '2026-02-28', how: 'Channel check, 2025', channel: 'call' },
    provenance: 'Synthetic profile (demo)',
  },
];

export const ALL_PEOPLE: Person[] = [ME, ...PEOPLE];
