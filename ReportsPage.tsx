import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { applyFilters, computeKpis, monthlySeries, aggregateByCategory, aggregateByRegion, aggregateBySegment, aggregateByCustomer } from '@/analytics/aggregations';
import { productPerformance } from '@/analytics/products';
import { inventoryAnalysis } from '@/analytics/inventory';
import { generateInsights } from '@/analytics/insights';
import { anomalySummary } from '@/analytics/anomalies';
import { Card } from '@/components/ui';
import { formatCurrency, formatNumber, formatPercent, formatMonth, formatDate } from '@/utils/format';
import { FileText, Printer, Download } from 'lucide-react';

export function ReportsPage() {
  const { records, filters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const monthly = useMemo(() => monthlySeries(filtered), [filtered]);
  const cats = useMemo(() => aggregateByCategory(filtered), [filtered]);
  const regions = useMemo(() => aggregateByRegion(filtered), [filtered]);
  const segments = useMemo(() => aggregateBySegment(filtered), [filtered]);
  const products = useMemo(() => productPerformance(filtered), [filtered]);
  const inv = useMemo(() => inventoryAnalysis(filtered), [filtered]);
  const insights = useMemo(() => generateInsights(filtered), [filtered]);
  const anomalies = useMemo(() => anomalySummary(filtered, 'dailyUnits'), [filtered]);
  const topCustomers = useMemo(() => aggregateByCustomer(filtered).slice(0, 10), [filtered]);

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const dateRange = filtered.length > 0
    ? `${formatDate([...filtered].sort((a, b) => a.date.localeCompare(b.date))[0].date)} to ${formatDate([...filtered].sort((a, b) => b.date.localeCompare(a.date))[0].date)}`
    : '—';

  const handlePrint = () => window.print();

  const downloadReport = () => {
    const lines: string[] = [];
    lines.push('RetailIQ — Analytics Report');
    lines.push(`Generated: ${today}`);
    lines.push(`Date range: ${dateRange}`);
    lines.push('');
    lines.push('EXECUTIVE KPIs');
    kpis.cards.forEach((c) => lines.push(`  ${c.label}: ${c.format === 'currency' ? formatCurrency(c.value) : c.format === 'percent' ? formatPercent(c.value) : formatNumber(c.value)}`));
    lines.push('');
    lines.push('CATEGORY PERFORMANCE');
    cats.forEach((c) => lines.push(`  ${c.category}: revenue ${formatCurrency(c.revenue)}, profit ${formatCurrency(c.profit)}, margin ${formatPercent(c.margin)}`));
    lines.push('');
    lines.push('REGIONAL PERFORMANCE');
    regions.forEach((r) => lines.push(`  ${r.region}: revenue ${formatCurrency(r.revenue)}, profit ${formatCurrency(r.profit)}`));
    lines.push('');
    lines.push('TOP 10 PRODUCTS');
    products.slice(0, 10).forEach((p, i) => lines.push(`  ${i + 1}. ${p.product}: ${formatCurrency(p.revenue)}, margin ${formatPercent(p.margin)}`));
    lines.push('');
    lines.push('INVENTORY ALERTS');
    inv.filter((i) => i.risk !== 'LOW').forEach((i) => lines.push(`  ${i.product}: ${i.status}, ${i.daysRemaining} days left`));
    lines.push('');
    lines.push('ANOMALIES (daily units)');
    lines.push(`  Total: ${anomalies.total} (High ${anomalies.high}, Medium ${anomalies.med}, Low ${anomalies.low})`);
    lines.push('');
    lines.push('BUSINESS INSIGHTS');
    insights.forEach((ins) => lines.push(`  - ${ins.title}: ${ins.insight}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retailiq-report-${today.replace(/\s/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-brand-500" />
          <div>
            <h1 className="text-xl font-semibold text-primary tracking-tight">Reports</h1>
            <p className="text-sm text-secondary mt-0.5">Consolidated analytics report — print or export a text summary.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadReport} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-app text-sm font-medium text-secondary hover:text-primary focus-ring">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 focus-ring">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-0">
        <div className="border-b border-app pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">RetailIQ Analytics Report</h2>
              <p className="text-sm text-secondary mt-0.5">Generated {today} · {dateRange} · {formatNumber(filtered.length)} transactions</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Executive Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpis.cards.map((c) => (
              <div key={c.label} className="border border-app rounded-lg p-3">
                <div className="text-xs text-muted">{c.label}</div>
                <div className="text-base font-semibold text-primary tnum mt-0.5">
                  {c.format === 'currency' ? formatCurrency(c.value) : c.format === 'percent' ? formatPercent(c.value) : formatNumber(c.value)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Monthly Trend</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted border-b border-app">
              <th className="py-2 pr-4 font-medium">Month</th>
              <th className="py-2 px-4 font-medium text-right">Revenue</th>
              <th className="py-2 px-4 font-medium text-right">Profit</th>
              <th className="py-2 px-4 font-medium text-right">Margin</th>
              <th className="py-2 px-4 font-medium text-right">Orders</th>
            </tr></thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.month} className="border-b border-app last:border-0">
                  <td className="py-2 pr-4 text-secondary">{formatMonth(m.month)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(m.revenue)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(m.profit)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatPercent(m.margin)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatNumber(m.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">By Category</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted border-b border-app">
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 px-4 font-medium text-right">Revenue</th>
                <th className="py-2 px-4 font-medium text-right">Margin</th>
              </tr></thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.category} className="border-b border-app last:border-0">
                    <td className="py-2 pr-4 text-secondary">{c.category}</td>
                    <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(c.revenue)}</td>
                    <td className="py-2 px-4 text-right tnum text-secondary">{formatPercent(c.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">By Region</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted border-b border-app">
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 px-4 font-medium text-right">Revenue</th>
                <th className="py-2 px-4 font-medium text-right">Margin</th>
              </tr></thead>
              <tbody>
                {regions.map((r) => (
                  <tr key={r.region} className="border-b border-app last:border-0">
                    <td className="py-2 pr-4 text-secondary">{r.region}</td>
                    <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(r.revenue)}</td>
                    <td className="py-2 px-4 text-right tnum text-secondary">{formatPercent(r.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Top 10 Products</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted border-b border-app">
              <th className="py-2 pr-4 font-medium">Product</th>
              <th className="py-2 px-4 font-medium text-right">Units</th>
              <th className="py-2 px-4 font-medium text-right">Revenue</th>
              <th className="py-2 px-4 font-medium text-right">Margin</th>
            </tr></thead>
            <tbody>
              {products.slice(0, 10).map((p) => (
                <tr key={p.product} className="border-b border-app last:border-0">
                  <td className="py-2 pr-4 text-secondary">{p.product}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatNumber(p.unitsSold)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(p.revenue)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatPercent(p.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Inventory Alerts</h3>
          {inv.filter((i) => i.risk !== 'LOW').length === 0 ? (
            <p className="text-sm text-secondary">No inventory alerts.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted border-b border-app">
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 px-4 font-medium">Status</th>
                <th className="py-2 px-4 font-medium text-right">Days left</th>
                <th className="py-2 px-4 font-medium">Action</th>
              </tr></thead>
              <tbody>
                {inv.filter((i) => i.risk !== 'LOW').map((i) => (
                  <tr key={i.product} className="border-b border-app last:border-0">
                    <td className="py-2 pr-4 text-secondary">{i.product}</td>
                    <td className="py-2 px-4 text-secondary">{i.status}</td>
                    <td className="py-2 px-4 text-right tnum text-secondary">{i.daysRemaining > 900 ? '∞' : i.daysRemaining}</td>
                    <td className="py-2 px-4 text-secondary text-xs">{i.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Top 10 Customers</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted border-b border-app">
              <th className="py-2 pr-4 font-medium">Customer</th>
              <th className="py-2 px-4 font-medium">Segment</th>
              <th className="py-2 px-4 font-medium text-right">Revenue</th>
              <th className="py-2 px-4 font-medium text-right">Margin</th>
            </tr></thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.customer} className="border-b border-app last:border-0">
                  <td className="py-2 pr-4 text-secondary">{c.customer}</td>
                  <td className="py-2 px-4 text-secondary">{c.segment}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(c.revenue)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatPercent(c.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Segment Performance</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted border-b border-app">
              <th className="py-2 pr-4 font-medium">Segment</th>
              <th className="py-2 px-4 font-medium text-right">Revenue</th>
              <th className="py-2 px-4 font-medium text-right">Orders</th>
              <th className="py-2 px-4 font-medium text-right">Avg Order</th>
            </tr></thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.segment} className="border-b border-app last:border-0">
                  <td className="py-2 pr-4 text-secondary">{s.segment}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(s.revenue)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatNumber(s.orders)}</td>
                  <td className="py-2 px-4 text-right tnum text-secondary">{formatCurrency(s.avgOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Anomalies & Business Insights</h3>
          <p className="text-sm text-secondary mb-2">Daily-unit anomalies: {anomalies.total} detected (High {anomalies.high}, Medium {anomalies.med}, Low {anomalies.low}).</p>
          <ul className="text-sm text-secondary space-y-2 list-disc pl-5">
            {insights.map((ins) => <li key={ins.id}><strong className="text-primary">{ins.title}:</strong> {ins.insight}</li>)}
          </ul>
        </section>
      </Card>
    </div>
  );
}
