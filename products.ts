import type { SalesRecord } from '@/types';
import { round, pctChange } from './stats';
import { sum } from './stats';

export type StockStatus = 'LOW STOCK' | 'HEALTHY' | 'OVERSTOCKED' | 'CRITICAL';

export interface ProductRow {
  product: string;
  category: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;     // percent
  growth: number | null; // percent vs earlier half of data
  stockStatus: StockStatus;
  badges: string[];   // BEST_SELLER, MOST_PROFITABLE, LOW_MARGIN, SLOW_MOVING, HIGH_GROWTH, LOW_GROWTH
}

const STOCK_LEVELS: Record<string, number> = {
  'Wireless Mouse': 320,
  'USB-C Hub': 180,
  'Bluetooth Speaker': 90,
  'Office Chair': 60,
  'Standing Desk': 40,
  'Bookshelf': 75,
  'Cotton T-Shirt': 480,
  'Denim Jacket': 150,
  'Running Shoes': 120,
  'Cookware Set': 85,
  'Air Fryer': 55,
  'LED Desk Lamp': 260,
  'Water Bottle': 600,
  'Notebook Set': 720,
  'Premium Pen': 340,
};

/** Build product performance table with derived metrics, growth, and classification badges. */
export function productPerformance(records: SalesRecord[]): ProductRow[] {
  // Split into earlier and later halves to compute growth.
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const midDate = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)].date : '';

  const groups = new Map<string, {
    product: string; category: string; units: number; revenue: number; cost: number; profit: number;
    earlyRevenue: number; lateRevenue: number; lastSale: string;
  }>();

  for (const r of sorted) {
    const cur = groups.get(r.product) ?? {
      product: r.product, category: r.category, units: 0, revenue: 0, cost: 0, profit: 0,
      earlyRevenue: 0, lateRevenue: 0, lastSale: r.date,
    };
    cur.units += r.quantity;
    cur.revenue += r.revenue;
    cur.cost += r.cost;
    cur.profit += r.profit;
    if (r.date < midDate) cur.earlyRevenue += r.revenue;
    else cur.lateRevenue += r.revenue;
    if (r.date > cur.lastSale) cur.lastSale = r.date;
    groups.set(r.product, cur);
  }

  const rows: ProductRow[] = [...groups.values()].map((g) => {
    const margin = g.revenue > 0 ? (g.profit / g.revenue) * 100 : 0;
    const growth = pctChange(g.earlyRevenue, g.lateRevenue);
    const stock = STOCK_LEVELS[g.product] ?? 100;
    const avgDaily = g.units / Math.max(1, Math.ceil((new Date(g.lastSale).getTime() - new Date(sorted[0].date).getTime()) / 86400000));
    const stockStatus = classifyStock(stock, avgDaily);
    return {
      product: g.product,
      category: g.category,
      unitsSold: g.units,
      revenue: round(g.revenue),
      cost: round(g.cost),
      profit: round(g.profit),
      margin: round(margin),
      growth: growth === null ? null : round(growth),
      stockStatus,
      badges: [],
    };
  });

  // Classification thresholds.
  const revenues = rows.map((r) => r.revenue);
  const profits = rows.map((r) => r.profit);
  const margins = rows.map((r) => r.margin);
  const units = rows.map((r) => r.unitsSold);
  const topRevenue = Math.max(...revenues) * 0.6;
  const topProfit = Math.max(...profits) * 0.6;
  const avgMargin = margins.reduce((s, m) => s + m, 0) / margins.length;
  const slowThreshold = Math.max(...units) * 0.2;

  for (const r of rows) {
    if (r.revenue >= topRevenue) r.badges.push('BEST_SELLER');
    if (r.profit >= topProfit) r.badges.push('MOST_PROFITABLE');
    if (r.margin < avgMargin * 0.6) r.badges.push('LOW_MARGIN');
    if (r.unitsSold <= slowThreshold) r.badges.push('SLOW_MOVING');
    if (r.growth !== null && r.growth > 15) r.badges.push('HIGH_GROWTH');
    if (r.growth !== null && r.growth < -5) r.badges.push('LOW_GROWTH');
  }

  return rows.sort((a, b) => b.revenue - a.revenue);
}

function classifyStock(stock: number, avgDaily: number): StockStatus {
  const days = avgDaily > 0 ? stock / avgDaily : Infinity;
  if (days < 7) return 'CRITICAL';
  if (days < 21) return 'LOW STOCK';
  if (days > 90) return 'OVERSTOCKED';
  return 'HEALTHY';
}

export function getStockLevel(product: string): number {
  return STOCK_LEVELS[product] ?? 100;
}

// Average daily sales per product (units/day) over the records' date span.
export function avgDailySalesByProduct(records: SalesRecord[]): Map<string, number> {
  const units = new Map<string, number>();
  for (const r of records) {
    units.set(r.product, (units.get(r.product) ?? 0) + r.quantity);
  }
  if (records.length === 0) return units;
  const dates = records.map((r) => r.date).sort();
  const spanDays = Math.max(1, Math.ceil((new Date(dates[dates.length - 1]).getTime() - new Date(dates[0]).getTime()) / 86400000));
  for (const [k, v] of units) units.set(k, v / spanDays);
  return units;
}

export function totalUnitsSold(records: SalesRecord[]): number {
  return sum(records.map((r) => r.quantity));
}
