import type { SalesRecord } from '@/types';
import { exponentialSmoothing, mean, stdDev, round } from './stats';

export interface ForecastResult {
  history: { label: string; actual: number | null; forecast: number | null }[];
  forecastTotal: number;
  forecastLower: number;
  forecastUpper: number;
  method: string;
  alpha: number;
  rmse: number;
  trend: 'Upward' | 'Downward' | 'Stable';
  periods: number;
}

/**
 * Demand forecasting using Holt's linear exponential smoothing with a trend term.
 * Series is aggregated to the chosen period (weekly or monthly) from historical
 * units sold, then smoothed. The forecast extends h periods ahead. A ±1.96
 * standard-error band (≈95% interval) is derived from in-sample residuals.
 */
export function forecastDemand(
  records: SalesRecord[],
  scope: { product: string; category: string },
  periods: number,
  periodUnit: 'weekly' | 'monthly' = 'monthly',
): ForecastResult {
  const filtered = records.filter(
    (r) =>
      (scope.product === 'all' || r.product === scope.product) &&
      (scope.category === 'all' || r.category === scope.category),
  );

  const buckets = new Map<string, number>();
  for (const r of filtered) {
    const key =
      periodUnit === 'monthly'
        ? r.date.slice(0, 7)
        : weekKey(r.dateObj);
    buckets.set(key, (buckets.get(key) ?? 0) + r.quantity);
  }

  const sortedKeys = [...buckets.keys()].sort();
  const series = sortedKeys.map((k) => buckets.get(k) ?? 0);

  if (series.length < 3) {
    return {
      history: sortedKeys.map((k) => ({ label: k, actual: buckets.get(k) ?? 0, forecast: null })),
      forecastTotal: 0,
      forecastLower: 0,
      forecastUpper: 0,
      method: 'Holt Linear Exponential Smoothing (insufficient data)',
      alpha: 0.4,
      rmse: 0,
      trend: 'Stable',
      periods,
    };
  }

  const alpha = 0.5;
  const { smoothed, forecast } = exponentialSmoothing(series, periods, alpha, true);

  // In-sample residuals for confidence band.
  const residuals = series.map((v, i) => v - smoothed[i]);
  const se = stdDev(residuals);
  const margin = 1.96 * se;

  const history: { label: string; actual: number | null; forecast: number | null }[] = sortedKeys.map((k, i) => ({
    label: k,
    actual: series[i],
    forecast: null,
  }));

  // Append forecast period labels.
  const lastKey = sortedKeys[sortedKeys.length - 1];
  const forecastLabels = generateForecastLabels(lastKey, periods, periodUnit);
  for (let i = 0; i < periods; i++) {
    history.push({ label: forecastLabels[i], actual: null, forecast: Math.max(0, round(forecast[i])) });
  }

  const forecastTotal = round(forecast.reduce((s, v) => s + Math.max(0, v), 0));
  const trendSlope = forecast[periods - 1] - forecast[0];
  const trend: ForecastResult['trend'] =
    trendSlope > series[0] * 0.02 ? 'Upward' : trendSlope < -series[0] * 0.02 ? 'Downward' : 'Stable';

  const rmse = Math.sqrt(mean(residuals.map((r) => r * r)));

  return {
    history,
    forecastTotal,
    forecastLower: Math.max(0, round(forecastTotal - margin)),
    forecastUpper: round(forecastTotal + margin),
    method: "Holt's Linear Exponential Smoothing (level + trend)",
    alpha,
    rmse: round(rmse, 1),
    trend,
    periods,
  };
}

function weekKey(d: Date): string {
  // ISO-ish week: year + week number.
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function generateForecastLabels(lastKey: string, periods: number, unit: 'weekly' | 'monthly'): string[] {
  const labels: string[] = [];
  if (unit === 'monthly') {
    const [y, m] = lastKey.split('-').map(Number);
    let year = y, month = m;
    for (let i = 0; i < periods; i++) {
      month += 1;
      if (month > 12) { month = 1; year += 1; }
      labels.push(`${year}-${String(month).padStart(2, '0')}`);
    }
  } else {
    const match = lastKey.match(/(\d+)-W(\d+)/);
    let year = match ? Number(match[1]) : 2024;
    let week = match ? Number(match[2]) : 1;
    for (let i = 0; i < periods; i++) {
      week += 1;
      if (week > 52) { week = 1; year += 1; }
      labels.push(`${year}-W${String(week).padStart(2, '0')}`);
    }
  }
  return labels;
}
