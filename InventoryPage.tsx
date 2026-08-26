import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { applyFilters } from '@/analytics/aggregations';
import { inventoryAnalysis, priorityReorderList } from '@/analytics/inventory';
import { Card, EmptyState, Badge } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import { Boxes, AlertTriangle, Database, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_TONE: Record<string, 'danger' | 'warning' | 'success' | 'neutral'> = {
  CRITICAL: 'danger',
  'LOW STOCK': 'warning',
  HEALTHY: 'success',
  OVERSTOCKED: 'neutral',
};

const RISK_TONE: Record<string, 'danger' | 'warning' | 'success'> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
};

export function InventoryPage() {
  const { records, filters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);
  const items = useMemo(() => inventoryAnalysis(filtered), [filtered]);
  const priority = useMemo(() => priorityReorderList(items), [items]);

  if (filtered.length === 0) {
    return <EmptyState icon={<Database className="w-10 h-10" />} title="No data for current filters" message="Adjust filters to see inventory analysis." />;
  }

  const critical = items.filter((i) => i.status === 'CRITICAL').length;
  const low = items.filter((i) => i.status === 'LOW STOCK').length;
  const healthy = items.filter((i) => i.status === 'HEALTHY').length;
  const over = items.filter((i) => i.status === 'OVERSTOCKED').length;

  const stats = [
    { label: 'Critical', value: critical, icon: XCircle, tone: 'text-danger-600 dark:text-danger-400' },
    { label: 'Low Stock', value: low, icon: AlertTriangle, tone: 'text-warning-600 dark:text-warning-400' },
    { label: 'Healthy', value: healthy, icon: CheckCircle2, tone: 'text-success-600 dark:text-success-400' },
    { label: 'Overstocked', value: over, icon: Boxes, tone: 'text-secondary' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Boxes className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Inventory Intelligence</h1>
          <p className="text-sm text-secondary mt-0.5">Days of cover, reorder points and stock-out risk computed from demand.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-surface border border-app rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-secondary">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.tone}`} />
              </div>
              <div className={`text-xl font-semibold tnum ${s.tone}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {priority.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-primary mb-1">Priority Reorder List</h3>
          <p className="text-xs text-muted mb-4">Items ranked by risk. Reorder point = avg daily sales × (lead time + safety stock), with lead time = 7 days.</p>
          <div className="space-y-2">
            {priority.map((item) => (
              <div key={item.product} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-3 rounded-lg bg-subtle border border-app">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-primary">{item.product}</span>
                    <Badge tone={RISK_TONE[item.risk]}>{item.risk} RISK</Badge>
                    <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                  </div>
                  <p className="text-xs text-secondary mt-1">{item.recommendedAction}</p>
                </div>
                <div className="grid grid-cols-4 gap-3 md:gap-5 text-center">
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Stock</div>
                    <div className="text-sm font-semibold text-primary tnum">{item.currentStock}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Avg Daily</div>
                    <div className="text-sm font-semibold text-primary tnum">{item.avgDailySales}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Days Left</div>
                    <div className="text-sm font-semibold text-primary tnum">{item.daysRemaining > 900 ? '—' : item.daysRemaining}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Reorder Pt</div>
                    <div className="text-sm font-semibold text-primary tnum">{item.reorderPoint}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="p-5 pb-0">
          <h3 className="text-sm font-semibold text-primary">Full Inventory Table</h3>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead className="border-y border-app">
              <tr className="text-left text-muted">
                <th className="py-2.5 px-3 font-medium">Product</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium text-right">Current Stock</th>
                <th className="py-2.5 px-3 font-medium text-right">Avg Daily Sales</th>
                <th className="py-2.5 px-3 font-medium text-right">Days Remaining</th>
                <th className="py-2.5 px-3 font-medium text-right">Reorder Point</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.product} className="border-b border-app last:border-0 hover:bg-subtle">
                  <td className="py-3 px-3 font-medium text-primary whitespace-nowrap">{item.product}</td>
                  <td className="py-3 px-3 text-secondary whitespace-nowrap">{item.category}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatNumber(item.currentStock)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{item.avgDailySales}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{item.daysRemaining > 900 ? '∞' : item.daysRemaining}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{item.reorderPoint}</td>
                  <td className="py-3 px-3"><Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge></td>
                  <td className="py-3 px-3"><Badge tone={RISK_TONE[item.risk]}>{item.risk}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-primary mb-3">How inventory metrics are calculated</h3>
        <ul className="text-sm text-secondary space-y-2">
          <li>• <strong className="text-primary">Average daily sales</strong> = total units sold ÷ number of days in the selected date range.</li>
          <li>• <strong className="text-primary">Days remaining</strong> = current stock ÷ average daily sales.</li>
          <li>• <strong className="text-primary">Reorder point</strong> = avg daily sales × (lead time + safety stock), lead time = 7 days, safety stock = 7 days of demand.</li>
          <li>• <strong className="text-primary">Status</strong>: Critical (&lt;7 days), Low Stock (&lt;21), Healthy (21–90), Overstocked (&gt;90).</li>
        </ul>
      </Card>
    </div>
  );
}
