// Mock portfolio: 15 NSE names across sizes and sectors.
// Prices, market caps and quarterly numbers are real, taken from screener.in on 13–14 Nov 2026.
// The refresh pipeline (scripts/refresh.ts) overwrites these with fresh data on every run.
import type { Company, Quarter } from '@/lib/types';

const ASOF = '2026-11-13';

export const COMPANIES: Company[] = [
  { ticker: 'HDFCBANK', name: 'HDFC Bank', short: 'HDFC Bank', bse: '500180', sector: 'Private bank', themes: ['banking', 'retail lending'], mcap: 1241454, price: 804, priceAsOf: ASOF, lender: true, holdingWeight: 9,
    related: [{ name: 'ICICI Bank', rel: 'competitor' }, { name: 'Kotak Mahindra Bank', rel: 'competitor' }] },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance', short: 'Bajaj Finance', bse: '500034', sector: 'Consumer NBFC', themes: ['consumer lending', 'nbfc'], mcap: 695439, price: 1117, priceAsOf: ASOF, lender: true, holdingWeight: 7,
    related: [{ name: 'Cholamandalam Finance', ticker: 'CHOLAFIN', rel: 'peer' }] },
  { ticker: 'CHOLAFIN', name: 'Cholamandalam Investment & Finance', short: 'Chola Finance', bse: '511243', sector: 'Vehicle & rural NBFC', themes: ['rural lending', 'vehicle finance', 'nbfc'], mcap: 158841, price: 1850, priceAsOf: ASOF, lender: true, holdingWeight: 6,
    related: [{ name: 'Shriram Finance', rel: 'competitor' }, { name: 'Bajaj Finance', ticker: 'BAJFINANCE', rel: 'peer' }] },
  { ticker: 'TITAN', name: 'Titan Company', short: 'Titan', bse: '500114', sector: 'Jewellery & lifestyle', themes: ['consumer', 'jewellery', 'retail'], mcap: 387696, price: 4367, priceAsOf: ASOF, holdingWeight: 8,
    related: [{ name: 'Kalyan Jewellers', rel: 'competitor' }, { name: 'Trent', ticker: 'TRENT', rel: 'peer' }] },
  { ticker: 'TRENT', name: 'Trent', short: 'Trent', bse: '500251', sector: 'Fashion retail', themes: ['consumer', 'retail'], mcap: 167997, price: 3165, priceAsOf: ASOF, holdingWeight: 6,
    related: [{ name: 'Avenue Supermarts', rel: 'peer' }, { name: 'Titan', ticker: 'TITAN', rel: 'peer' }] },
  { ticker: 'ASIANPAINT', name: 'Asian Paints', short: 'Asian Paints', bse: '500820', sector: 'Decorative paints', themes: ['consumer', 'paints'], mcap: 244595, price: 2550, priceAsOf: ASOF, holdingWeight: 6,
    related: [{ name: 'Berger Paints', rel: 'competitor' }, { name: 'Grasim (Birla Opus)', rel: 'competitor' }] },
  { ticker: 'DIXON', name: 'Dixon Technologies', short: 'Dixon', bse: '540699', sector: 'Electronics manufacturing', themes: ['electronics manufacturing', 'ems'], mcap: 78334, price: 12798, priceAsOf: ASOF, holdingWeight: 6,
    related: [{ name: 'Kaynes Technology', rel: 'competitor' }, { name: 'Amber Enterprises', rel: 'competitor' }] },
  { ticker: 'PIIND', name: 'PI Industries', short: 'PI Industries', bse: '523642', sector: 'Agrochem CSM', themes: ['specialty chemicals', 'agrochemicals'], mcap: 26017, price: 1715, priceAsOf: ASOF, holdingWeight: 4,
    related: [{ name: 'SRF', ticker: 'SRF', rel: 'peer' }, { name: 'UPL', rel: 'competitor' }] },
  { ticker: 'SRF', name: 'SRF', short: 'SRF', bse: '503806', sector: 'Fluorochemicals & films', themes: ['specialty chemicals', 'fluorochemicals'], mcap: 73365, price: 2475, priceAsOf: ASOF, holdingWeight: 5,
    related: [{ name: 'Navin Fluorine', rel: 'competitor' }, { name: 'PI Industries', ticker: 'PIIND', rel: 'peer' }] },
  { ticker: 'POLYCAB', name: 'Polycab India', short: 'Polycab', bse: '542652', sector: 'Cables & wires', themes: ['electricals', 'capex cycle'], mcap: 119121, price: 7904, priceAsOf: ASOF, holdingWeight: 6,
    related: [{ name: 'KEI Industries', rel: 'competitor' }, { name: 'Larsen & Toubro', ticker: 'LT', rel: 'customer' }] },
  { ticker: 'PERSISTENT', name: 'Persistent Systems', short: 'Persistent', bse: '533179', sector: 'IT services', themes: ['it services', 'software'], mcap: 99550, price: 6003, priceAsOf: ASOF, holdingWeight: 7,
    related: [{ name: 'Nagarro', rel: 'peer' }, { name: 'Coforge', rel: 'competitor' }, { name: 'KPIT Technologies', ticker: 'KPITTECH', rel: 'peer' }] },
  { ticker: 'KPITTECH', name: 'KPIT Technologies', short: 'KPIT', bse: '542651', sector: 'Automotive software', themes: ['it services', 'automotive software'], mcap: 15133, price: 552, priceAsOf: ASOF, holdingWeight: 3,
    related: [{ name: 'Tata Elxsi', rel: 'competitor' }, { name: 'Persistent Systems', ticker: 'PERSISTENT', rel: 'peer' }] },
  { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', short: 'Sun Pharma', bse: '524715', sector: 'Pharma', themes: ['pharma', 'usfda'], mcap: 451075, price: 1880, priceAsOf: ASOF, holdingWeight: 7,
    related: [{ name: "Dr. Reddy's", rel: 'competitor' }, { name: 'Cipla', rel: 'competitor' }] },
  { ticker: 'LT', name: 'Larsen & Toubro', short: 'L&T', bse: '500510', sector: 'Engineering & construction', themes: ['infrastructure', 'capex cycle'], mcap: 569741, price: 4144, priceAsOf: ASOF, holdingWeight: 8,
    related: [{ name: 'Polycab', ticker: 'POLYCAB', rel: 'supplier' }, { name: 'KEC International', rel: 'competitor' }] },
  { ticker: 'ETERNAL', name: 'Eternal (Zomato)', short: 'Eternal', bse: '543320', sector: 'Food delivery & quick commerce', themes: ['consumer internet', 'quick commerce'], mcap: 351272, price: 364, priceAsOf: ASOF, holdingWeight: 5,
    related: [{ name: 'Swiggy', rel: 'competitor' }, { name: 'Zepto', rel: 'competitor' }] },
];

const L = ['Sep 2025', 'Dec 2025', 'Mar 2026', 'Jun 2026', 'Sep 2026'];
type Row = [number, number | null, number, number, number, number, number];
const q = (rows: Row[]): Quarter[] => rows.map((r, i) => ({ label: L[i], sales: r[0], ebitda: r[1], otherIncome: r[2], interest: r[3], dep: r[4], pbt: r[5], pat: r[6] }));

// [sales, EBITDA(op profit ex OI), other income, interest, depreciation, PBT, PAT] — consolidated, ₹ cr
export const QUARTERS: Record<string, Quarter[]> = {
  TITAN: q([[18725, 1875, 113, 277, 189, 1522, 1120], [25416, 2713, -1, 282, 207, 2223, 1684], [26920, 1938, 235, 350, 246, 1577, 1179], [21356, 2890, 148, 353, 256, 2429, 1777], [20614, 2983, 816, 536, 263, 3000, 2393]]),
  DIXON: q([[14855, 561, 497, 38, 96, 924, 746], [10672, 414, 139, 43, 99, 412, 321], [10511, 408, 90, 24, 105, 370, 298], [15548, 463, 537, 24, 107, 869, 718], [21794, 597, 72, 26, 110, 532, 411]]),
  PERSISTENT: q([[3581, 683, 52, 18, 100, 617, 471], [3778, 733, -49, 19, 101, 565, 439], [4056, 768, 33, 19, 109, 674, 529], [4303, 697, 71, 29, 115, 623, 483], [4664, 633, 24, 38, 167, 454, 352]]),
  HDFCBANK: q([[86994, null, 31567, 46741, 0, 26659, 20364], [87067, null, 39860, 45821, 0, 26961, 20691], [87182, null, 29737, 45220, 0, 27672, 21074], [90575, null, 42535, 47626, 0, 27193, 20383], [95132, null, 34227, 50667, 0, 28663, 21537]]),
  BAJFINANCE: q([[19990, null, 5, 7011, 258, 6608, 4948], [21013, null, -262, 7339, 244, 5431, 4066], [21606, null, 11, 7398, 256, 7410, 5553], [23165, null, 6, 7942, 288, 8149, 6081], [24546, null, 33, 8602, 321, 8537, 6367]]),
  CHOLAFIN: q([[7491, null, 123, 3517, 71, 1566, 1160], [7898, null, 111, 3646, 74, 1736, 1290], [8417, null, 148, 3753, 72, 2143, 1645], [8856, null, 102, 4007, 75, 2224, 1656], [9271, null, 125, 4334, 83, 2188, 1630]]),
  TRENT: q([[4818, 816, 28, 42, 325, 477, 373], [5345, 1081, 5, 43, 367, 676, 510], [5028, 911, 28, 44, 377, 519, 413], [5755, 1119, 30, 47, 410, 692, 518], [5873, 1057, 26, 44, 420, 619, 468]]),
  ASIANPAINT: q([[8531, 1503, 237, 44, 305, 1392, 1018], [8867, 1781, 69, 48, 313, 1489, 1074], [9247, 1787, 197, 59, 310, 1614, 1185], [10542, 2169, 279, 48, 304, 2096, 1559], [9977, 1557, 290, 55, 314, 1478, 1085]]),
  PIIND: q([[1872, 541, 85, 3, 98, 525, 409], [1376, 302, 172, 6, 105, 363, 311], [1565, 337, 74, 4, 107, 300, 200], [1702, 367, 66, 8, 104, 322, 244], [1702, 233, 65, 8, 105, 184, 122]]),
  SRF: q([[3640, 774, 26, 71, 212, 517, 388], [3713, 780, -46, 66, 217, 452, 433], [4615, 1026, 13, 62, 220, 757, 582], [5033, 1237, 34, 69, 223, 979, 759], [4904, 946, 25, 71, 229, 671, 509]]),
  POLYCAB: q([[6477, 1021, 45, 48, 97, 921, 693], [7636, 966, 50, 69, 106, 842, 630], [8864, 1161, 60, 75, 98, 1049, 786], [8210, 1136, 105, 80, 103, 1058, 797], [9899, 1422, 88, 94, 111, 1306, 990]]),
  KPITTECH: q([[1588, 298, 24, 16, 75, 231, 169], [1617, 311, -26, 23, 81, 181, 133], [1711, 317, 12, 22, 82, 225, 163], [1675, 257, 8, 23, 83, 160, 116], [1691, 267, 8, 21, 86, 168, 121]]),
  SUNPHARMA: q([[14478, 4527, 470, 100, 730, 4168, 3125], [15521, 4948, 89, 78, 732, 4227, 3381], [14612, 3954, 458, 86, 775, 3551, 2710], [15300, 4418, 520, 100, 739, 4099, 2901], [16199, 4744, -752, 75, 758, 3159, 1995]]),
  LT: q([[67984, 8513, 1384, 2470, 1092, 6336, 4678], [71450, 9190, -350, 2399, 1072, 5370, 3825], [82762, 10419, 1647, 2488, 1168, 8410, 6133], [67942, 8149, 2377, 2571, 1032, 6922, 4988], [78750, 8814, 2306, 2442, 1037, 7641, 5949]]),
  ETERNAL: q([[13590, 239, 352, 86, 376, 129, 65], [16315, 368, 348, 107, 439, 170, 102], [17292, 486, 342, 132, 468, 228, 174], [20211, 594, 375, 151, 546, 272, 92], [24138, 752, 351, 155, 625, 323, 125]]),
};

export const SEED_AS_OF = '2026-11-14T09:30:00+05:30';
