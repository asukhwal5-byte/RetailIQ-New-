import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { aggregateByCustomer, aggregateBySegment, applyFilters, uniqueValues } from '@/analytics/aggregations';
import { Card, ChartTitle, EmptyState, Badge } from '@/components/ui';
import { formatCurrency, formatNumber, formatPercent, tooltipCurrency } from '@/utils/format';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Users, Database, Crown } from 'lucide-react';

const SEG_COLORS = ['#1870f5', '#14b88a', '#f98c0c', '#e23b54'];

export function CustomerAnalyticsPage() {
  const { records, filters, setFilters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);
  const customers = useMemo(() => aggregateByCustomer(filtered), [filtered]);
  const segments = useMemo(() => aggregateBySegment(filtered), [filtered]);
  const [region, setRegion] = useState('all');

  const regions = useMemo(() => ['all', ...uniqueValues(records.map((r) => r.region))], [records]);
  const regionFiltered = useMemo(
    () => (region === 'all' ? customers : customers.filter((c) => c.region === region)),
    [customers, region],
  );

  if (filtered.length === 0) {
    return <EmptyState icon={<Database className="w-10 h-10" />} title="No data for current filters" message="Adjust filters to see customer analytics." />;
  }

  const top10 = regionFiltered.slice(0, 10);
  const totalRevenue = customers.reduce((s, c) => s + c.revenue, 0);
  const segPie = segments.map((s) => ({ name: s.segment, value: s.revenue }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Users className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Customer Analytics</h1>
          <p className="text-sm text-secondary mt-0.5">Top customers, segment mix and regional contribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Total customers</div>
          <div className="text-xl font-semibold text-primary tnum">{formatNumber(customers.length)}</div>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Avg revenue / customer</div>
          <div className="text-xl font-semibold text-primary tnum">{formatCurrency(totalRevenue / Math.max(1, customers.length))}</div>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Top customer share</div>
          <div className="text-xl font-semibold text-primary tnum">{formatPercent((customers[0]?.revenue ?? 0) / Math.max(1, totalRevenue) * 100)}</div>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Segments</div>
          <div className="text-xl font-semibold text-primary tnum">{segments.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <ChartTitle
            title="Top 10 Customers by Revenue"
            subtitle="Ranked contribution"
            right={
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-surface border border-app rounded-lg px-2.5 py-1.5 text-xs text-primary focus-ring">
                {regions.map((r) => <option key={r} value={r}>{r === 'all' ? 'All regions' : r}</option>)}
              </select>
            }
          />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10.map((c) => ({ name: c.customer, Revenue: c.revenue, Profit: c.profit }))} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipCurrency} />
              <Legend />
              <Bar dataKey="Revenue" fill="#1870f5" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Profit" fill="#14b88a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Revenue by Segment" subtitle="Share" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={segPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {segPie.map((_, i) => <Cell key={i} fill={SEG_COLORS[i % SEG_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={tooltipCurrency} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <ChartTitle title="Segment Performance" subtitle="Revenue, profit, orders and average order value" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-app">
                <th className="py-2.5 px-3 font-medium">Segment</th>
                <th className="py-2.5 px-3 font-medium text-right">Revenue</th>
                <th className="py-2.5 px-3 font-medium text-right">Profit</th>
                <th className="py-2.5 px-3 font-medium text-right">Orders</th>
                <th className="py-2.5 px-3 font-medium text-right">Avg Order</th>
                <th className="py-2.5 px-3 font-medium text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.segment} className="border-b border-app last:border-0">
                  <td className="py-3 px-3 font-medium text-primary">{s.segment}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatCurrency(s.revenue)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatCurrency(s.profit)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatNumber(s.orders)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatCurrency(s.avgOrderValue)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatPercent(s.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0 flex items-center gap-2">
          <Crown className="w-4 h-4 text-warning-500" />
          <h3 className="text-sm font-semibold text-primary">All Customers</h3>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead className="border-y border-app">
              <tr className="text-left text-muted">
                <th className="py-2.5 px-3 font-medium">Customer</th>
                <th className="py-2.5 px-3 font-medium">Segment</th>
                <th className="py-2.5 px-3 font-medium">Region</th>
                <th className="py-2.5 px-3 font-medium text-right">Revenue</th>
                <th className="py-2.5 px-3 font-medium text-right">Profit</th>
                <th className="py-2.5 px-3 font-medium text-right">Orders</th>
                <th className="py-2.5 px-3 font-medium text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {regionFiltered.slice(0, 25).map((c, i) => (
                <tr key={c.customer} className="border-b border-app last:border-0 hover:bg-subtle">
                  <td className="py-2.5 px-3 font-medium text-primary whitespace-nowrap">
                    {i < 3 && <Badge tone={i === 0 ? 'warning' : 'neutral'}>#{i + 1}</Badge>} {c.customer}
                  </td>
                  <td className="py-2.5 px-3 text-secondary">{c.segment}</td>
                  <td className="py-2.5 px-3 text-secondary">{c.region}</td>
                  <td className="py-2.5 px-3 text-right tnum text-secondary">{formatCurrency(c.revenue)}</td>
                  <td className="py-2.5 px-3 text-right tnum text-secondary">{formatCurrency(c.profit)}</td>
                  <td className="py-2.5 px-3 text-right tnum text-secondary">{formatNumber(c.orders)}</td>
                  <td className="py-2.5 px-3 text-right tnum text-secondary">{formatPercent(c.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
