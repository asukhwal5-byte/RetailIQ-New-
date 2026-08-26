import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { applyFilters } from '@/analytics/aggregations';
import { productPerformance, type ProductRow } from '@/analytics/products';
import { Card, EmptyState, Badge } from '@/components/ui';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import { Package, ArrowUpDown, Database, TrendingUp, TrendingDown } from 'lucide-react';

type SortKey = keyof Pick<ProductRow, 'product' | 'category' | 'unitsSold' | 'revenue' | 'cost' | 'profit' | 'margin' | 'growth'>;

const BADGE_TONE: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'accent' | 'neutral'> = {
  BEST_SELLER: 'info',
  MOST_PROFITABLE: 'success',
  LOW_MARGIN: 'warning',
  SLOW_MOVING: 'neutral',
  HIGH_GROWTH: 'accent',
  LOW_GROWTH: 'danger',
};

const BADGE_LABEL: Record<string, string> = {
  BEST_SELLER: 'Best Seller',
  MOST_PROFITABLE: 'Most Profitable',
  LOW_MARGIN: 'Low Margin',
  SLOW_MOVING: 'Slow Moving',
  HIGH_GROWTH: 'High Growth',
  LOW_GROWTH: 'Low Growth',
};

const STATUS_TONE: Record<string, 'danger' | 'warning' | 'success' | 'neutral'> = {
  CRITICAL: 'danger',
  'LOW STOCK': 'warning',
  HEALTHY: 'success',
  OVERSTOCKED: 'neutral',
};

export function ProductPerformancePage() {
  const { records, filters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);
  const rows = useMemo(() => productPerformance(filtered), [filtered]);
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterBadge, setFilterBadge] = useState<string>('all');

  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [rows, sortKey, sortDir]);

  const visible = filterBadge === 'all' ? sorted : sorted.filter((r) => r.badges.includes(filterBadge));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('desc'); }
  };

  if (filtered.length === 0) {
    return <EmptyState icon={<Database className="w-10 h-10" />} title="No data for current filters" message="Adjust filters to see product performance." />;
  }

  const Th = ({ k, label, align = 'left' }: { k: SortKey; label: string; align?: 'left' | 'right' }) => (
    <th
      onClick={() => toggleSort(k)}
      className={`py-2.5 px-3 font-medium text-muted cursor-pointer select-none hover:text-primary whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? 'text-brand-500' : 'text-muted/60'}`} />
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Package className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Product Performance</h1>
          <p className="text-sm text-secondary mt-0.5">Per-product revenue, profit, margin, growth and classification.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'BEST_SELLER', 'MOST_PROFITABLE', 'LOW_MARGIN', 'SLOW_MOVING', 'HIGH_GROWTH', 'LOW_GROWTH'].map((b) => (
          <button
            key={b}
            onClick={() => setFilterBadge(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-ring
              ${filterBadge === b ? 'bg-brand-600 text-white' : 'bg-surface border border-app text-secondary hover:text-primary'}`}
          >
            {b === 'all' ? 'All products' : BADGE_LABEL[b]}
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-app">
              <tr>
                <Th k="product" label="Product" />
                <Th k="category" label="Category" />
                <Th k="unitsSold" label="Units" align="right" />
                <Th k="revenue" label="Revenue" align="right" />
                <Th k="cost" label="Cost" align="right" />
                <Th k="profit" label="Profit" align="right" />
                <Th k="margin" label="Margin" align="right" />
                <Th k="growth" label="Growth" align="right" />
                <th className="py-2.5 px-3 font-medium text-muted text-left">Stock</th>
                <th className="py-2.5 px-3 font-medium text-muted text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.product} className="border-b border-app last:border-0 hover:bg-subtle transition-colors">
                  <td className="py-3 px-3 font-medium text-primary whitespace-nowrap">{r.product}</td>
                  <td className="py-3 px-3 text-secondary whitespace-nowrap">{r.category}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatNumber(r.unitsSold)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatCurrency(r.revenue)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatCurrency(r.cost)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatCurrency(r.profit)}</td>
                  <td className="py-3 px-3 text-right tnum text-secondary">{formatPercent(r.margin)}</td>
                  <td className="py-3 px-3 text-right tnum">
                    {r.growth === null ? <span className="text-muted">—</span> : (
                      <span className={`inline-flex items-center gap-0.5 ${r.growth >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                        {r.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(Math.abs(r.growth))}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3"><Badge tone={STATUS_TONE[r.stockStatus]}>{r.stockStatus}</Badge></td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {r.badges.map((b) => <Badge key={b} tone={BADGE_TONE[b]}>{BADGE_LABEL[b]}</Badge>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-primary mb-3">How products are classified</h3>
        <ul className="text-sm text-secondary space-y-2">
          <li>• <strong className="text-primary">Best Seller</strong> — revenue in the top tier of the portfolio.</li>
          <li>• <strong className="text-primary">Most Profitable</strong> — absolute profit in the top tier.</li>
          <li>• <strong className="text-primary">Low Margin</strong> — margin below 60% of the portfolio average (margin = profit / revenue).</li>
          <li>• <strong className="text-primary">Slow Moving</strong> — units sold in the bottom 20% of the fastest mover.</li>
          <li>• <strong className="text-primary">High / Low Growth</strong> — revenue change between the first and second half of the data exceeds ±15% / falls below −5%.</li>
        </ul>
      </Card>
    </div>
  );
}
