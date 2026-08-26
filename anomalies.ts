import type { SalesRecord } from '@/types';
import { zScore, iqrBounds, mean, stdDev, round } from './stats';

export type AnomalySeverity = 'High' | 'Medium' | 'Low';
export type AnomalyMetric = 'quantity' | 'revenue' | 'sellingPrice' | 'orderValue' | 'dailyUnits';

export interface Anomaly {
  date: string;
  product: string;
  category: string;
  metric: AnomalyMetric;
  value: number;
  expectedLower: number;
  expectedUpper: number;
  severity: AnomalySeverity;
  z: number;
  possibleReason: string;
}

const METRIC_LABEL: Record<AnomalyMetric, string> = {
  quantity: 'Quantity sold',
  revenue: 'Transaction revenue',
  sellingPrice: 'Selling price',
  orderValue: 'Order value',
  dailyUnits: 'Daily units sold',
};

export function metricLabel(m: AnomalyMetric): string {
  return METRIC_LABEL[m];
}

/**
 * Anomaly detection combining two explainable methods:
 *  - Z-score (|z| > 3) flags extreme deviations relative to the mean.
 *  - IQR fences (value outside [Q1-1.5IQR, Q3+1.5IQR]) flags robust outliers.
 * A record is reported when EITHER method trips, and the stricter severity wins.
 * Severity: |z| >= 4 -> High, |z| >= 3 -> Medium, otherwise IQR-only -> Low.
 */
export function detectAnomalies(records: SalesRecord[], metric: AnomalyMetric): Anomaly[] {
  if (records.length < 10) return [];

  let values: number[];
  let rowValue: (r: SalesRecord) => number;
  let dailyMap: Map<string, { units: number; date: string; product: string; category: string }>;

  if (metric === 'dailyUnits') {
    // Aggregate per day across all products.
    dailyMap = new Map();
    for (const r of records) {
      const cur = dailyMap.get(r.date) ?? { units: 0, date: r.date, product: '(all products)', category: '(all)' };
      cur.units += r.quantity;
      dailyMap.set(r.date, cur);
    }
    const days = [...dailyMap.values()];
    values = days.map((d) => d.units);
    const bounds = iqrBounds(values);
    const mu = mean(values);
    const anomalies: Anomaly[] = [];
    for (const d of days) {
      const z = zScore(d.units, values);
      if (Math.abs(z) >= 3 || d.units < bounds.lower || d.units > bounds.upper) {
        anomalies.push(buildAnomaly(d.date, d.product, d.category, d.units, bounds.lower, bounds.upper, z, metric));
      }
    }
    return anomalies.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  }

  switch (metric) {
    case 'quantity': rowValue = (r) => r.quantity; values = records.map(rowValue); break;
    case 'revenue': rowValue = (r) => r.revenue; values = records.map(rowValue); break;
    case 'sellingPrice': rowValue = (r) => r.sellingPrice; values = records.map(rowValue); break;
    case 'orderValue': rowValue = (r) => r.revenue; values = records.map(rowValue); break;
  }

  const bounds = iqrBounds(values);
  const anomalies: Anomaly[] = [];
  for (const r of records) {
    const v = rowValue(r);
    const z = zScore(v, values);
    if (Math.abs(z) >= 3 || v < bounds.lower || v > bounds.upper) {
      anomalies.push(buildAnomaly(r.date, r.product, r.category, v, bounds.lower, bounds.upper, z, metric));
    }
  }
  return anomalies.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
}

function buildAnomaly(
  date: string, product: string, category: string, value: number,
  lower: number, upper: number, z: number, metric: AnomalyMetric,
): Anomaly {
  const az = Math.abs(z);
  const severity: AnomalySeverity = az >= 4 ? 'High' : az >= 3 ? 'Medium' : 'Low';
  const possibleReason = guessReason(metric, value, upper, lower);
  return {
    date, product, category, metric, value: round(value),
    expectedLower: round(Math.max(0, lower)),
    expectedUpper: round(upper),
    severity, z: round(z, 2), possibleReason,
  };
}

function guessReason(metric: AnomalyMetric, value: number, upper: number, lower: number): string {
  if (value > upper) {
    if (metric === 'sellingPrice') return 'Possible price increase, premium variant, or data-entry error.';
    if (metric === 'dailyUnits') return 'Promotional event, seasonal spike, or bulk corporate order.';
    return 'Bulk/corporate order, promo-driven spike, or possible data-entry error.';
  }
  if (value < lower) {
    if (metric === 'sellingPrice') return 'Clearance discount, promotional pricing, or keying error.';
    return 'Stock-out, low-traffic day, or data capture gap.';
  }
  return 'Statistical outlier detected by combined Z-score + IQR screening.';
}

export function anomalySummary(records: SalesRecord[], metric: AnomalyMetric) {
  const anomalies = detectAnomalies(records, metric);
  const high = anomalies.filter((a) => a.severity === 'High').length;
  const med = anomalies.filter((a) => a.severity === 'Medium').length;
  const low = anomalies.filter((a) => a.severity === 'Low').length;
  return { total: anomalies.length, high, med, low, anomalies };
}

export { stdDev };
