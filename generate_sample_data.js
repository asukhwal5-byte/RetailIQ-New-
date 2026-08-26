// Standalone generator for sample_retail_data.csv — mirrors the logic in src/data/sampleData.ts
// Run: node data/generate_sample_data.js
import { writeFileSync } from 'fs';

const PRODUCTS = [
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
const CUSTOMERS = [
  'Sharma Traders', 'Mehta Retail', 'Verma Stores', 'Patel Mart', 'Gupta Enterprises',
  'Singh Sales', 'Reddy Distributors', 'Iyer Supplies', 'Nair Commerce', 'Kapoor Goods',
  'Joshi Wholesale', 'Bose Retailers', 'Das & Sons', 'Rao Merchandise', 'Nair Retail Hub',
  'Malhotra Trading', 'Chopra Bazaar', 'Khanna Outlets', 'Saxena Stores', 'Agarwal Mart',
];

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240101);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

const rows = [];
const today = new Date('2024-12-15');
const startDate = new Date('2023-07-01');
const totalDays = Math.floor((today - startDate) / 86400000);

for (let d = 0; d <= totalDays; d++) {
  const date = new Date(startDate.getTime() + d * 86400000);
  const month = date.getMonth();
  const monthIndex = Math.floor(d / 30);
  const dow = date.getDay();
  const weekendBoost = dow === 0 || dow === 6 ? 1.15 : 1;
  const txCount = 1 + Math.floor(rand() * 3);

  for (let t = 0; t < txCount; t++) {
    const spec = pick(PRODUCTS);
    const season = spec.seasonality[month];
    const trendFactor = Math.pow(spec.trend, monthIndex);
    const baseQty = 8 + Math.floor(rand() * 22);
    const qty = Math.max(1, Math.round(baseQty * season * trendFactor * weekendBoost));
    const isAnomaly = rand() < 0.02;
    const anomalyQty = isAnomaly ? qty * (3 + Math.floor(rand() * 4)) : qty;
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
      customer: pick(CUSTOMERS),
    });
  }
}

rows.sort((a, b) => a.date.localeCompare(b.date));

const header = 'Date,Product,Category,Quantity,SellingPrice,CostPrice,Region,Customer';
const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
const body = rows.map((r) =>
  [r.date, esc(r.product), esc(r.category), r.quantity, r.sellingPrice, r.costPrice, esc(r.region), esc(r.customer)].join(','),
);
const csv = [header, ...body].join('\n');

writeFileSync('data/sample_retail_data.csv', csv);
console.log(`Generated ${rows.length} rows → data/sample_retail_data.csv`);
