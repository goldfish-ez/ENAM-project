// Rule-based classifier: exchange subject/sub-category → the reference taxonomy.
// Rules handle ~90% of filings for free; anything left 'unclassified' with a long body can be
// sent to the bulk model (flash-lite) by the pipeline. Order matters: first match wins.
import type { Category } from './types';

const RULES: [Category, RegExp][] = [
  ['results', /financial results|results for the (quarter|year)|outcome of board meeting.*results|investor presentation.*result|newspaper.*result|shareholders?.? letter|half.?yearly report|integrated filing.*financial/i],
  ['earnings_call', /earnings call|conference call|concall|audio recording|transcript/i],
  ['M&A', /acqui|amalgamation|merger|demerger|scheme of arrangement|joint venture|share swap|restructuring|divest|stake sale|incorporation of (a )?(wholly owned )?subsidiar/i],
  ['management_change', /change in (directorate|management|key managerial|kmp|senior management)|appointment of (director|ceo|cfo|md|managing|chief|company secretary|chairman)|resignation of|cessation|re-?appoint|superannuat|retire/i],
  ['pledging', /pledge|encumbrance/i],
  ['insider_trading', /insider trading|reg(ulation)?\.? ?7\(2\)|sast|reg(ulation)?\.? ?29|reg(ulation)?\.? ?31|acquisition of shares by promoter/i],
  ['credit_rating', /credit rating|rating (agency|action)|crisil|icra|care ratings|india ratings/i],
  ['fund_raise', /\bqip\b|qualified institution|preferential|warrant|rights issue|buy ?back|non.?convertible debenture|\bncds?\b|commercial paper|fund.?rais|raising of funds|allotment of (equity|securities|debentures)/i],
  ['dividend', /dividend/i],
  ['bonus_split', /bonus issue|sub.?division|stock split/i],
  ['capex', /capex|capacity expansion|new (plant|facility|manufacturing)|greenfield|brownfield|commissioning/i],
  ['litigation', /litigation|penalt|show cause|order (passed|received)|nclt|nclat|cirp|insolvency|court|tribunal|tax demand|gst|sebi order|adjudicat|dispute/i],
  ['postal_ballot', /postal ballot|scrutini[sz]er/i],
  ['agm_egm', /\bagm\b|\begm\b|annual general meeting|extraordinary general meeting/i],
  ['investor_meetings', /analyst|investor meet|institutional investor|investor conference|one.?on.?one/i],
  ['press_release', /press release|media release|order (win|received|bagged|inflow)|bags? order|wins? (an? )?order|launch|partnership|clarification|rumou?r|verification of market rumour|news (item|report)/i],
];

export function classify(subject: string, extra = ''): Category {
  const text = `${subject} ${extra}`;
  // Loss of share certificates, ESOP allotments, RTA changes, compliance certificates → routine.
  if (/repayment|redemption|interest payment|esop|esps|loss of share certificate|duplicate share|rta|registrar and share transfer|compliance certificate|reg(ulation)? ?74\(5\)|trading window|dematerial|newspaper (publication|advertisement)(?!.*result)/i.test(text)) {
    if (!/result/i.test(text)) return 'unclassified';
  }
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  return 'unclassified';
}

export const CATEGORY_LABEL: Record<Category, string> = {
  results: 'Results', 'M&A': 'M&A', fund_raise: 'Fund raise', management_change: 'Management', litigation: 'Litigation',
  insider_trading: 'Insider / SAST', earnings_call: 'Earnings call', investor_meetings: 'Investor meets', credit_rating: 'Credit rating',
  dividend: 'Dividend', bonus_split: 'Bonus / split', capex: 'Capex', press_release: 'Press release', postal_ballot: 'Postal ballot',
  agm_egm: 'AGM / EGM', pledging: 'Pledging', unclassified: 'Routine',
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
