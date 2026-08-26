import type { RawSalesRow, CustomerSegment } from '@/types';

// Catalog of products with base prices, cost ratios, categories, and seasonal weight.
interface ProductSpec {
  product: string;
  category: string;
  basePrice: number;
  costRatio: number; // cost as fraction of selling price
  seasonality: number[]; // 12 monthly multipliers
  trend: number; // per-month growth factor
}

const PRODUCTS: ProductSpec[] = [
  { product: 'Wireless Mouse', category: 'Electronics', basePrice: 799, costRatio: 0.62, seasonality: [0.8,0.8,0.9,1,1,0.9,0.85,0.9,1.1,1.2,1.4,1.5], trend: 1.012 },
  { product: 'USB-C Hub', category: 'Electronics', basePrice: 1499, costRatio: 0.58, seasonality: [0.9,1,1,1,1.1,1,1,1,1.1,1.2,1.3,1.4], trend: 1.015 },
  { product: 'Bluetooth Speaker', category: 'Electronics', basePrice: 2199, costRatio: 0.60, seasonality: [0.7,0.8,0.9,1,1.1,1.2,1.3,1.2,1,1,1.2,1.4], trend: 1.01 },
  { product: 'Office Chair', category: 'Furniture', basePrice: 6499, costRatio: 0.68, seasonality: [0.9,1,1,1,1,1,0.9,0.95,1.1,1.1,1,0.9], trend: 1.008 },
  { product: 'Standing Desk', category: 'Furniture', basePrice: 12999, costRatio: 0.72, seasonality: [0.9,1,1.1,1.1,1,0.9,0.9,0.9,1,1.1,1,0.9], trend: 1.018 },
  { product: 'Bookshelf', category: 'Furniture', basePrice: 3499, costRatio: 0.65, seasonality: [1,0.9,0.9,1,1,1,0.9,0.9,1,1.1,1.1,1], trend: 1.005 },
  { product: 'Cotton T-Shirt', category: 'Apparel', basePrice: 499, costRatio: 0.45, seasonality: [0.6,0.7,0.9,1.1,1.3,1.4,1.3,1.2,1,0.9,0.7,0.6], trend: 1.009 },
  { product: 'Denim Jacket', category: 'Apparel', basePrice: 1799, costRatio: 0.52, seasonality: [0.8,0.9,1,1,0.9,0.8,0.7,0.8,1,1.2,1.3,1.1], trend: 1.006 },
  { product: 'Running Shoes', category: 'Apparel', basePrice: 2499, costRatio: 0.55, seasonality: [0.8,0.8,0.9,1.1,1.3,1.4,1.3,1.2,1,0.9,0.8,0.8], trend: 1.011 },
  { product: 'Cookware Set', category: 'Home', basePrice: 3999, costRatio: 0.60, seasonality: [0.9,1,1,1,1,0.9,0.9,0.9,1,1.1,1.3,1.4], trend: 1.007 },
  { product: 'Air Fryer', category: 'Home', basePrice: 5499, costRatio: 0.63, seasonality: [0.8,0.9,1,1,1,0.9,0.85,0.9,1,1.2,1.4,1.5], trend: 1.02 },
  { product: 'LED Desk Lamp', category: 'Home', basePrice: 999, costRatio: 0.50, seasonality: [1,1,1,1,1,0.9,0.9,0.9,1.1,1.1,1.2,1.3], trend: 1.004 },
  { product: 'Water Bottle', category: 'Home', basePrice: 349, costRatio: 0.40, seasonality: [0.7,0.8,1,1.2,1.4,1.5,1.4,1.3,1.1,1,0.8,0.7], trend: 1.01 },
  { product: 'Notebook Set', category: 'Stationery', basePrice: 249, costRatio: 0.38, seasonality: [0.9,0.8,0.9,1.1,1,0.8,0.7,0.8,1.3,1.4,1.1,0.9], trend: 1.003 },
  { product: 'Premium Pen', category: 'Stationery', basePrice: 699, costRatio: 0.42, seasonality: [0.9,0.9,1,1,0.9,0.8,0.7,0.8,1.2,1.3,1.2,1.1], trend: 1.006 },
];

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const SEGMENTS: CustomerSegment[] = ['Retail', 'Wholesale', 'Online', 'Corporate'];

// Weighted customer names per region for realism.
const CUSTOMER_NAMES = [
  'Sharma Traders', 'Mehta Retail', 'Verma Stores', 'Patel Mart', 'Gupta Enterprises',
  'Singh Sales', 'Reddy Distributors', 'Iyer Supplies', 'Nair Commerce', 'Kapoor Goods',
  'Joshi Wholesale', 'Bose Retailers', 'Das & Sons', 'Rao Merchandise', 'Nair Retail Hub',
  'Malhotra Trading', 'Chopra Bazaar', 'Khanna Outlets', 'Saxena Stores', 'Agarwal Mart',
];

// Deterministic PRNG so the dataset is stable across reloads.
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240101);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Generate a realistic sample retail dataset of ~1200 transaction rows spanning
 * the last ~18 months. Demand follows per-product seasonality and a gentle upward
 * trend, with a few injected anomaly days so anomaly detection has real signal.
 */
export function generateSampleData(): RawSalesRow[] {
  const rows: RawSalesRow[] = [];
  const today = new Date('2024-12-15');
  const startDate = new Date('2023-07-01');
  const totalDays = Math.floor((today.getTime() - startDate.getTime()) / 86400000);

  let id = 0;

  // Walk day by day; emit a variable number of transactions per day.
  for (let d = 0; d <= totalDays; d++) {
    const date = new Date(startDate.getTime() + d * 86400000);
    const month = date.getMonth(); // 0-11
    const monthIndex = Math.floor(d / 30); // ~trend month index
    const dow = date.getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.15 : 1;

    // Average ~2.2 transactions per day -> ~1200 over 530 days.
    const txCount = 1 + Math.floor(rand() * 3);

    for (let t = 0; t < txCount; t++) {
      const spec = pick(PRODUCTS);
      const season = spec.seasonality[month];
      const trendFactor = Math.pow(spec.trend, monthIndex);

      // Base daily demand per product drawn around a mean; quantity per transaction.
      const baseQty = 8 + Math.floor(rand() * 22);
      const qty = Math.max(1, Math.round(baseQty * season * trendFactor * weekendBoost));

      // Inject ~2% anomaly transactions (unusually large orders).
      const isAnomaly = rand() < 0.02;
      const anomalyQty = isAnomaly ? qty * (3 + Math.floor(rand() * 4)) : qty;

      // Price varies ±6% around base; occasional 10% promo discount.
      const promo = rand() < 0.12 ? 0.9 : 1;
      const priceJitter = 1 + (rand() - 0.5) * 0.12;
      const sellingPrice = round2(spec.basePrice * priceJitter * promo);
      const costPrice = round2(spec.basePrice * spec.costRatio * (1 + (rand() - 0.5) * 0.06));

      rows.push({
        date: date.toISOString().slice(0, 10),
        product: spec.product,
        category: spec.category,
        quantity: anomalyQty,
        sellingPrice,
        costPrice,
        region: pick(REGIONS),
        customer: pick(CUSTOMER_NAMES),
      });
      id++;
    }
  }

  // Sort by date for stable downstream aggregation.
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

export const SAMPLE_CSV_HEADERS = [
  'Date', 'Product', 'Category', 'Quantity', 'SellingPrice', 'CostPrice', 'Region', 'Customer',
];
