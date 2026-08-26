import type { RawSalesRow, SalesRecord, Filters, KpiCard, CustomerSegment } from '@/types';
import { mean, sum, pctChange, round } from './stats';

export const ALL_FILTER = 'all';

const SEGMENTS: CustomerSegment[] = ['Retail', 'Wholesale', 'Online', 'Corporate'];

/** Turn raw rows into enriched sales records with derived fields. */
export function enrichRows(rows: RawSalesRow[]): SalesRecord[] {
  return rows.map((r, i) => {
    const revenue = r.quantity * r.sellingPrice;
    const cost = r.quantity * r.costPrice;
    const profit = revenue - cost;
    const margin = revenue > 0 ? profit / revenue : 0;
    return {
      ...r,
      id: i,
      dateObj: new Date(r.date),
      revenue,
      cost,
      profit,
      margin,
      monthKey: r.date.slice(0, 7),
      segment: pickSegment(r.customer),
    };
  });
}

// Deterministic segment assignment from customer name hash so it's stable.
function pickSegment(customer: string): CustomerSegment {
  let h = 0;
  for (let i = 0; i < customer.length; i++) h = (h * 31 + customer.charCodeAt(i)) | 0;
  return SEGMENTS[Math.abs(h) % SEGMENTS.length];
}

export function applyFilters(records: SalesRecord[], f: Filters): SalesRecord[] {
  return records.filter((r) => {
    if (f.dateFrom && r.date < f.dateFrom) return false;
    if (f.dateTo && r.date > f.dateTo) return false;
    if (f.category !== ALL_FILTER && r.category !== f.category) return false;
    if (f.product !== ALL_FILTER && r.product !== f.product) return false;
    if (f.region !== ALL_FILTER && r.region !== f.region) return false;
    if (f.segment !== ALL_FILTER && r.segment !== f.segment) return false;
    return true;
  });
}

export function defaultFilters(records: SalesRecord[]): Filters {
  if (records.length === 0) {
    return { dateFrom: '', dateTo: '', category: ALL_FILTER, product: ALL_FILTER, region: ALL_FILTER, segment: ALL_FILTER };
  }
  const dates = records.map((r) => r.date).sort();
  return {
    dateFrom: dates[0],
    dateTo: dates[dates.length - 1],
    category: ALL_FILTER,
    product: ALL_FILTER,
    region: ALL_FILTER,
    segment: ALL_FILTER,
  };
}

export function uniqueValues<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort();
}

export interface KpiSummary {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  unitsSold: number;
  avgOrderValue: number;
  prevRevenue: number;
  prevProfit: number;
  prevOrders: number;
  prevUnits: number;
  cards: KpiCard[];
}

/** Compute executive KPI cards plus comparison to the previous equal-length period. */
export function computeKpis(records: SalesRecord[]): KpiSummary {
  if (records.length === 0) {
    return {
      totalRevenue: 0, totalProfit: 0, profitMargin: 0, totalOrders: 0,
      unitsSold: 0, avgOrderValue: 0, prevRevenue: 0, prevProfit: 0, prevOrders: 0, prevUnits: 0,
      cards: [],
    };
  }
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const minDate = new Date(sorted[0].date);
  const maxDate = new Date(sorted[sorted.length - 1].date);
  const spanMs = maxDate.getTime() - minDate.getTime();
  const prevEnd = new Date(minDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - spanMs);

  const curr = sorted;
  const prev = sorted.filter((r) => r.dateObj >= prevStart && r.dateObj <= prevEnd);

  const totalRevenue = sum(curr.map((r) => r.revenue));
  const totalProfit = sum(curr.map((r) => r.profit));
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalOrders = new Set(curr.map((r) => r.date + r.customer)).size || curr.length;
  const unitsSold = sum(curr.map((r) => r.quantity));
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const prevRevenue = sum(prev.map((r) => r.revenue));
  const prevProfit = sum(prev.map((r) => r.profit));
  const prevOrders = new Set(prev.map((r) => r.date + r.customer)).size || prev.length;
  const prevUnits = sum(prev.map((r) => r.quantity));

  const cards: KpiCard[] = [
    { label: 'Total Revenue', value: totalRevenue, format: 'currency', change: pctChange(prevRevenue, totalRevenue) },
    { label: 'Total Profit', value: totalProfit, format: 'currency', change: pctChange(prevProfit, totalProfit) },
    { label: 'Profit Margin', value: profitMargin, format: 'percent', change: pctChange(prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0, profitMargin) },
    { label: 'Total Orders', value: totalOrders, format: 'number', change: pctChange(prevOrders, totalOrders) },
    { label: 'Units Sold', value: unitsSold, format: 'number', change: pctChange(prevUnits, unitsSold) },
    { label: 'Avg Order Value', value: avgOrderValue, format: 'currency', change: pctChange(prevOrders > 0 ? prevRevenue / prevOrders : 0, avgOrderValue) },
  ];

  return { totalRevenue, totalProfit, profitMargin, totalOrders, unitsSold, avgOrderValue, prevRevenue, prevProfit, prevOrders, prevUnits, cards };
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
  units: number;
  margin: number;
  growth: number | null;
}

export function monthlySeries(records: SalesRecord[]): MonthlyPoint[] {
  const map = new Map<string, { revenue: number; profit: number; orders: number; units: number }>();
  for (const r of records) {
    const m = r.monthKey;
    const cur = map.get(m) ?? { revenue: 0, profit: 0, orders: 0, units: 0 };
    cur.revenue += r.revenue;
    cur.profit += r.profit;
    cur.units += r.quantity;
    cur.orders += 1;
    map.set(m, cur);
  }
  const months = [...map.keys()].sort();
  const points: MonthlyPoint[] = [];
  for (const m of months) {
    const v = map.get(m)!;
    const margin = v.revenue > 0 ? (v.profit / v.revenue) * 100 : 0;
    points.push({ month: m, revenue: round(v.revenue), profit: round(v.profit), orders: v.orders, units: v.units, margin: round(margin), growth: null });
  }
  // Compute MoM growth on revenue.
  for (let i = 1; i < points.length; i++) {
    points[i].growth = pctChange(points[i - 1].revenue, points[i].revenue);
  }
  return points;
}

export interface CategoryAgg {
  category: string;
  revenue: number;
  profit: number;
  units: number;
  margin: number;
  orders: number;
}

export function aggregateByCategory(records: SalesRecord[]): CategoryAgg[] {
  const map = new Map<string, { revenue: number; profit: number; units: number; orders: number }>();
  for (const r of records) {
    const cur = map.get(r.category) ?? { revenue: 0, profit: 0, units: 0, orders: 0 };
    cur.revenue += r.revenue;
    cur.profit += r.profit;
    cur.units += r.quantity;
    cur.orders += 1;
    map.set(r.category, cur);
  }
  return [...map.entries()].map(([category, v]) => ({
    category,
    revenue: round(v.revenue),
    profit: round(v.profit),
    units: v.units,
    orders: v.orders,
    margin: v.revenue > 0 ? round((v.profit / v.revenue) * 100) : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}

export interface RegionAgg {
  region: string;
  revenue: number;
  profit: number;
  units: number;
  orders: number;
  margin: number;
}

export function aggregateByRegion(records: SalesRecord[]): RegionAgg[] {
  const map = new Map<string, { revenue: number; profit: number; units: number; orders: number }>();
  for (const r of records) {
    const cur = map.get(r.region) ?? { revenue: 0, profit: 0, units: 0, orders: 0 };
    cur.revenue += r.revenue;
    cur.profit += r.profit;
    cur.units += r.quantity;
    cur.orders += 1;
    map.set(r.region, cur);
  }
  return [...map.entries()].map(([region, v]) => ({
    region,
    revenue: round(v.revenue),
    profit: round(v.profit),
    units: v.units,
    orders: v.orders,
    margin: v.revenue > 0 ? round((v.profit / v.revenue) * 100) : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}

export interface SegmentAgg {
  segment: string;
  revenue: number;
  profit: number;
  orders: number;
  margin: number;
  avgOrderValue: number;
}

export function aggregateBySegment(records: SalesRecord[]): SegmentAgg[] {
  const map = new Map<string, { revenue: number; profit: number; orders: number }>();
  for (const r of records) {
    const cur = map.get(r.segment) ?? { revenue: 0, profit: 0, orders: 0 };
    cur.revenue += r.revenue;
    cur.profit += r.profit;
    cur.orders += 1;
    map.set(r.segment, cur);
  }
  return [...map.entries()].map(([segment, v]) => ({
    segment,
    revenue: round(v.revenue),
    profit: round(v.profit),
    orders: v.orders,
    margin: v.revenue > 0 ? round((v.profit / v.revenue) * 100) : 0,
    avgOrderValue: v.orders > 0 ? round(v.revenue / v.orders) : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}

export interface CustomerAgg {
  customer: string;
  segment: string;
  region: string;
  revenue: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
  margin: number;
}

export function aggregateByCustomer(records: SalesRecord[]): CustomerAgg[] {
  const map = new Map<string, { customer: string; segment: string; region: string; revenue: number; profit: number; orders: number }>();
  for (const r of records) {
    const cur = map.get(r.customer) ?? { customer: r.customer, segment: r.segment, region: r.region, revenue: 0, profit: 0, orders: 0 };
    cur.revenue += r.revenue;
    cur.profit += r.profit;
    cur.orders += 1;
    map.set(r.customer, cur);
  }
  return [...map.values()].map((v) => ({
    ...v,
    revenue: round(v.revenue),
    profit: round(v.profit),
    avgOrderValue: v.orders > 0 ? round(v.revenue / v.orders) : 0,
    margin: v.revenue > 0 ? round((v.profit / v.revenue) * 100) : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}

export function dailySeries(records: SalesRecord[]): { date: string; revenue: number; units: number; orders: number }[] {
  const map = new Map<string, { revenue: number; units: number; orders: number }>();
  for (const r of records) {
    const cur = map.get(r.date) ?? { revenue: 0, units: 0, orders: 0 };
    cur.revenue += r.revenue;
    cur.units += r.quantity;
    cur.orders += 1;
    map.set(r.date, cur);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({
    date,
    revenue: round(v.revenue),
    units: v.units,
    orders: v.orders,
  }));
}

export function averageMetric(xs: number[]): number {
  return round(mean(xs));
}
