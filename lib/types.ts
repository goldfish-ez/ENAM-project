// Shared domain types. The refresh pipeline, the live research engine and the UI all speak these.

export type Category =
  | 'results' | 'M&A' | 'fund_raise' | 'management_change' | 'litigation' | 'insider_trading'
  | 'earnings_call' | 'investor_meetings' | 'credit_rating' | 'dividend' | 'bonus_split' | 'capex'
  | 'press_release' | 'postal_ballot' | 'agm_egm' | 'pledging' | 'unclassified';

export interface RelatedCo { name: string; ticker?: string; rel: 'competitor' | 'supplier' | 'customer' | 'peer' }

export interface Company {
  ticker: string;            // NSE symbol
  name: string;
  short: string;
  bse: string;               // BSE scrip code (filings API)
  sector: string;
  themes: string[];          // used by the expertise map
  mcap: number;              // ₹ cr
  price: number;             // ₹, last close
  priceAsOf: string;         // ISO date
  lender?: boolean;          // EBITDA is not meaningful for banks/NBFCs
  related?: RelatedCo[];
  holdingWeight?: number;    // % of mock portfolio
}

export interface Quarter {
  label: string;             // "Sep 2026"
  sales: number;             // ₹ cr (revenue for lenders)
  ebitda: number | null;     // screener "Operating Profit" (ex other income); null for lenders
  otherIncome: number;
  interest: number;
  dep: number;
  pbt: number;
  pat: number;
}

/** Facts pulled out of a filing (bulk-extraction step; flash-lite in the live pipeline). */
export interface FilingFacts {
  amountCr?: number;
  person?: string;           // id into people registry when it resolves
  personName?: string;
  role?: string;
  effective?: string;
  counterparty?: string;
  direction?: 'up' | 'down';
  note?: string;
}

export interface Filing {
  id: string;
  ticker: string;
  at: string;                // ISO datetime (IST)
  title: string;             // exchange subject
  summary?: string;          // one-line description (from filing)
  url: string;
  category?: Category;
  facts?: FilingFacts;
  source: 'bse' | 'nse' | 'company';
}

export interface PricePoint { d: string; c: number; v: number }

export interface Annual {
  years: string[];           // "Mar 2021" ...
  sales: (number | null)[];
  op?: (number | null)[];    // operating profit (EBITDA ex OI)
  pat?: (number | null)[];
  cfo?: (number | null)[];
  fcf?: (number | null)[];
  cfoToOp?: (number | null)[];      // %
  debtorDays?: (number | null)[];
  inventoryDays?: (number | null)[];
  payableDays?: (number | null)[];
  ccc?: (number | null)[];
  roce?: (number | null)[];          // %
  equity?: (number | null)[];        // equity capital + reserves
  borrowings?: (number | null)[];
}

export interface Fundamentals {
  ticker: string;
  name: string;
  about?: string;
  bse?: string;
  price?: number;
  mcap?: number;
  pe?: number;
  roce?: number;
  roe?: number;
  lender?: boolean;
  quarters: Quarter[];       // oldest → newest
  annual?: Annual;
  docs?: { label: string; url: string; kind: 'transcript' | 'annual_report' | 'presentation' }[];
  source: { label: string; url: string };
}

export type GuidanceStatus = 'met' | 'on-track' | 'at-risk' | 'missed' | 'unclear';

export interface GuidanceItem {
  promise: string;
  metric: string;
  said: { when: string; quote: string; who?: string; url?: string }[];
  delivered: { label: string; value: string; note?: string }[];
  status: GuidanceStatus;
  verdict: string;
}

export interface Research {
  ticker: string;
  name: string;
  asOf: string;
  mode: 'curated' | 'live' | 'numbers-only';
  model?: string;
  business?: { what: string; mix?: { name: string; share: number }[] };
  numbers: { label: string; value: string; sub?: string; tone?: 'up' | 'down' | 'flat' }[];
  trajectory: { insight: string[] };
  balance: { insight: string[]; proforma?: string };
  cash: { insight: string[] };
  guidance?: GuidanceItem[];
  tone?: string[];                      // how management's language shifted
  narrative?: { agree: string[]; diverge: string[] };
  bull?: string[];
  bear?: string[];
  sources: { label: string; url: string }[];
  note?: string;
}

// ---------- Network ----------

export interface Role {
  org: string;               // canonical org id, e.g. "icici-bank"
  orgName: string;
  ticker?: string;
  title: string;
  from: number;
  to: number | null;         // null = present
  senior?: boolean;          // CXO / ED / MD / board
}

export interface Edu { school: string; schoolName: string; degree?: string; from: number; to: number }

export interface Person {
  id: string;
  name: string;
  kind: 'contact' | 'public';         // contact = in investor's network (synthetic); public = appears in filings
  headline: string;
  city?: string;
  roles: Role[];
  education: Edu[];
  expertise?: string[];
  rel?: {
    strength: 1 | 2 | 3 | 4 | 5;      // how well the investor knows them
    lastContact: string;              // ISO date
    how: string;                      // how they met
    channel?: 'call' | 'whatsapp' | 'email' | 'met';
  };
  links?: { label: string; url: string }[];
  provenance: string;                 // where this profile came from
}

export interface Connection {
  kind: 'worked' | 'studied' | 'board';
  org: string;
  orgName: string;
  from: number;
  to: number;
  detail: string;            // human sentence
  weight: number;            // 0..1
}

export interface Path {
  via?: Person;              // undefined = direct
  target: Person;
  links: Connection[];
  score: number;             // 0..1
  why: string;
}
