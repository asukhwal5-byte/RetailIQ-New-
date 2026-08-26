import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { applyFilters, computeKpis, monthlySeries, aggregateByCategory, aggregateByRegion } from '@/analytics/aggregations';
import { KpiCardGrid } from '@/components/KpiCardGrid';
import { Card, ChartTitle, EmptyState } from '@/components/ui';
import { formatCurrency, formatMonth, formatPercent, formatNumber, tooltipCurrency, tooltipPercent } from '@/utils/format';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { LayoutDashboard, Database } from 'lucide-react';

const PIE_COLORS = ['#1870f5', '#14b88a', '#f98c0c', '#e23b54', '#8b5cf6', '#0ea5e9'];

export function DashboardPage() {
  const { records, filters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const monthly = useMemo(() => monthlySeries(filtered), [filtered]);
  const cats = useMemo(() => aggregateByCategory(filtered), [filtered]);
  const regions = useMemo(() => aggregateByRegion(filtered), [filtered]);

  if (filtered.length === 0) {
    return <EmptyState icon={<Database className="w-10 h-10" />} title="No data for current filters" message="Adjust the date range or clear filters to see dashboard metrics." />;
  }

  const chartData = monthly.map((m) => ({ month: formatMonth(m.month), Revenue: m.revenue, Profit: m.profit }));
  const marginData = monthly.map((m) => ({ month: formatMonth(m.month), Margin: m.margin }));
  const regionData = regions.map((r) => ({ name: r.region, value: r.revenue }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 text-secondary">
        <LayoutDashboard className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-secondary mt-0.5">Revenue, profit and performance across the current filter scope.</p>
        </div>
      </div>

      <KpiCardGrid cards={kpis.cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <ChartTitle title="Revenue & Profit Trend" subtitle="Monthly" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ left: -8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1870f5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1870f5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b88a" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#14b88a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={tooltipCurrency} />
              <Legend />
              <Area type="monotone" dataKey="Revenue" stroke="#1870f5" strokeWidth={2} fill="url(#gRev)" />
              <Area type="monotone" dataKey="Profit" stroke="#14b88a" strokeWidth={2} fill="url(#gProf)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Revenue by Region" subtitle="Share of total" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {regionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={tooltipCurrency} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <ChartTitle title="Profit Margin Trend" subtitle="Monthly (%) — margin = profit / revenue × 100" />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={marginData} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={48} domain={['auto', 'auto']} />
              <Tooltip formatter={tooltipPercent} />
              <Line type="monotone" dataKey="Margin" stroke="#f98c0c" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Revenue by Category" subtitle="Ranked" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cats.map((c) => ({ name: c.category, Revenue: c.revenue }))} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
              <Tooltip formatter={tooltipCurrency} />
              <Bar dataKey="Revenue" fill="#1870f5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <ChartTitle title="Regional Performance" subtitle="Revenue, profit and margin by region" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-app">
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 px-4 font-medium text-right">Revenue</th>
                <th className="py-2 px-4 font-medium text-right">Profit</th>
                <th className="py-2 px-4 font-medium text-right">Units</th>
                <th className="py-2 px-4 font-medium text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.region} className="border-b border-app last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-primary">{r.region}</td>
                  <td className="py-2.5 px-4 text-right tnum text-secondary">{formatCurrency(r.revenue)}</td>
                  <td className="py-2.5 px-4 text-right tnum text-secondary">{formatCurrency(r.profit)}</td>
                  <td className="py-2.5 px-4 text-right tnum text-secondary">{formatNumber(r.units)}</td>
                  <td className="py-2.5 px-4 text-right tnum text-secondary">{formatPercent(r.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
