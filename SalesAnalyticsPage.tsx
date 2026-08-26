import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { applyFilters, monthlySeries, aggregateByCategory, aggregateByRegion, dailySeries } from '@/analytics/aggregations';
import { FilterBar } from '@/components/FilterBar';
import { Card, ChartTitle, EmptyState } from '@/components/ui';
import { formatCurrency, formatMonth, formatPercent, formatNumber, tooltipCurrency, tooltipNumber, tooltipPercent } from '@/utils/format';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { TrendingUp, Database } from 'lucide-react';

export function SalesAnalyticsPage() {
  const { records, filters, setFilters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);

  const monthly = useMemo(() => monthlySeries(filtered), [filtered]);
  const cats = useMemo(() => aggregateByCategory(filtered), [filtered]);
  const regions = useMemo(() => aggregateByRegion(filtered), [filtered]);
  const daily = useMemo(() => dailySeries(filtered), [filtered]);

  if (filtered.length === 0) {
    return (
      <div className="space-y-5">
        <FilterBar records={records} filters={filters} onChange={setFilters} />
        <EmptyState icon={<Database className="w-10 h-10" />} title="No data for current filters" message="Adjust the filters above to see sales analytics." />
      </div>
    );
  }

  const revData = monthly.map((m) => ({ month: formatMonth(m.month), Revenue: m.revenue }));
  const profData = monthly.map((m) => ({ month: formatMonth(m.month), Profit: m.profit }));
  const orderData = monthly.map((m) => ({ month: formatMonth(m.month), Orders: m.orders }));
  const growthData = monthly.map((m) => ({ month: formatMonth(m.month), Growth: m.growth ?? 0 }));
  const catRev = cats.map((c) => ({ name: c.category, Revenue: c.revenue, Profit: c.profit }));
  const regionRev = regions.map((r) => ({ name: r.region, Revenue: r.revenue, Profit: r.profit }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <TrendingUp className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-secondary mt-0.5">Revenue, profit, orders and growth — all charts respond to filters.</p>
        </div>
      </div>

      <FilterBar records={records} filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <ChartTitle title="Revenue over Time" subtitle="Monthly" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revData} margin={{ left: -8, right: 8, top: 8 }}>
              <defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1870f5" stopOpacity={0.25} /><stop offset="100%" stopColor="#1870f5" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={tooltipCurrency} />
              <Area type="monotone" dataKey="Revenue" stroke="#1870f5" strokeWidth={2} fill="url(#gR)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Profit over Time" subtitle="Monthly" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={profData} margin={{ left: -8, right: 8, top: 8 }}>
              <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14b88a" stopOpacity={0.25} /><stop offset="100%" stopColor="#14b88a" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={tooltipCurrency} />
              <Area type="monotone" dataKey="Profit" stroke="#14b88a" strokeWidth={2} fill="url(#gP)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Orders over Time" subtitle="Monthly transaction count" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={orderData} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => formatNumber(v)} tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={tooltipNumber} />
              <Bar dataKey="Orders" fill="#1870f5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Monthly Growth" subtitle="Month-over-month revenue growth (%)" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={growthData} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={tooltipPercent} />
              <Bar dataKey="Growth" radius={[4, 4, 0, 0]}>
                {growthData.map((g, i) => <Cell key={i} fill={g.Growth >= 0 ? '#14b88a' : '#e23b54'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <ChartTitle title="Revenue & Profit by Category" subtitle="Comparison" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={catRev} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={tooltipCurrency} />
              <Legend />
              <Bar dataKey="Revenue" fill="#1870f5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#14b88a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Sales by Region" subtitle="Revenue & profit" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regionRev} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={tooltipCurrency} />
              <Legend />
              <Bar dataKey="Revenue" fill="#1870f5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#f98c0c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <ChartTitle title="Daily Sales (revenue)" subtitle="Granular daily trend across the selected scope" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={daily.map((d) => ({ date: d.date.slice(5), Revenue: d.revenue }))} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} />
            <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} width={56} />
            <Tooltip formatter={tooltipCurrency} />
            <Line type="monotone" dataKey="Revenue" stroke="#1870f5" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
