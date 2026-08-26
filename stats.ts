/**
 * Statistical helpers — mean, median, std dev, variance, percent change,
 * moving average, exponential smoothing, z-score, IQR, correlation.
 * All pure functions with explicit math comments so the methodology is visible.
 */

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function variance(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1); // sample variance
}

export function stdDev(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

/** Population std dev (used by z-score anomaly detection so outliers don't inflate sigma). */
export function popStdDev(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
}

export function sum(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0);
}

export function min(xs: number[]): number {
  return xs.length ? Math.min(...xs) : 0;
}

export function max(xs: number[]): number {
  return xs.length ? Math.max(...xs) : 0;
}

/** Percent change from previous to current. Returns null when previous is 0. */
export function pctChange(prev: number, curr: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

/** Pearson correlation coefficient in [-1, 1]. */
export function correlation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

/** Simple moving average of window size k. */
export function movingAverage(xs: number[], k: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    const start = Math.max(0, i - k + 1);
    const window = xs.slice(start, i + 1);
    out.push(mean(window));
  }
  return out;
}

/**
 * Exponential smoothing forecast.
 * s_t = alpha * x_t + (1 - alpha) * s_{t-1}
 * Forecast for next h periods = last smoothed value (level), with optional
 * trend damping via Holt's linear method when `trend` is true.
 * Returns the smoothed history plus h future points.
 */
export function exponentialSmoothing(
  series: number[],
  h: number,
  alpha = 0.4,
  trend = false,
): { smoothed: number[]; forecast: number[] } {
  if (series.length === 0) return { smoothed: [], forecast: [] };
  let level = series[0];
  let slope = 0;
  const smoothed: number[] = [level];

  for (let t = 1; t < series.length; t++) {
    const prevLevel = level;
    if (trend) {
      // Holt's linear trend method
      level = alpha * series[t] + (1 - alpha) * (level + slope);
      const beta = 0.2;
      slope = beta * (level - prevLevel) + (1 - beta) * slope;
    } else {
      level = alpha * series[t] + (1 - alpha) * level;
    }
    smoothed.push(trend ? level + slope : level);
  }

  const forecast: number[] = [];
  for (let i = 1; i <= h; i++) {
    forecast.push(trend ? level + i * slope : level);
  }
  return { smoothed, forecast };
}

/** Z-score of a value relative to a series (population std). */
export function zScore(value: number, xs: number[]): number {
  const sigma = popStdDev(xs);
  if (sigma === 0) return 0;
  return (value - mean(xs)) / sigma;
}

/** IQR-based bounds: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]. */
export function iqrBounds(xs: number[]): { lower: number; upper: number; q1: number; q3: number } {
  const sorted = [...xs].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  return { lower: q1 - 1.5 * iqr, upper: q3 + 1.5 * iqr, q1, q3 };
}

export function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

/** Round to n decimals. */
export function round(n: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

/** Break-even point in units = fixedCost / (price - variableCostPerUnit). */
export function breakEvenUnits(fixedCost: number, price: number, variableCost: number): number {
  const contribution = price - variableCost;
  if (contribution <= 0) return Infinity;
  return fixedCost / contribution;
}
