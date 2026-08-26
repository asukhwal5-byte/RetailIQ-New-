/** Formatting helpers for Indian-format currency, compact numbers, and percents. */

export function formatCurrency(n: number): string {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatCurrencyFull(n: number): string {
  if (!isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatPercent(n: number, decimals = 1): string {
  if (!isFinite(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function formatChange(change: number | null): string {
  if (change === null) return '—';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function formatMonth(key: string): string {
  const [y, m] = key.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Recharts tooltip formatters — accept ValueType (number | string | array) and coerce. */
export const tooltipCurrency = (v: unknown) => formatCurrency(Number(v));
export const tooltipNumber = (v: unknown) => formatNumber(Number(v));
export const tooltipPercent = (v: unknown) => formatPercent(Number(v));
export const tooltipOrNull = (v: unknown) => (v === null || v === undefined ? '—' : `${formatNumber(Number(v))} units`);
