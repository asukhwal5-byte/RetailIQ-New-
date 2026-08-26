import type { KpiCard } from '@/types';
import { formatCurrency, formatNumber, formatPercent, formatChange } from '@/utils/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ICONS: Record<string, typeof TrendingUp> = {
  'Total Revenue': TrendingUp,
  'Total Profit': TrendingUp,
  'Profit Margin': TrendingUp,
  'Total Orders': TrendingUp,
  'Units Sold': TrendingUp,
  'Avg Order Value': TrendingUp,
};

function formatValue(c: KpiCard): string {
  if (c.format === 'currency') return formatCurrency(c.value);
  if (c.format === 'percent') return formatPercent(c.value);
  return formatNumber(c.value);
}

export function KpiCardGrid({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = ICONS[c.label] ?? TrendingUp;
        const change = c.change;
        const positive = change !== null && change >= 0;
        return (
          <div key={c.label} className="bg-surface border border-app rounded-xl p-4 shadow-card hover:shadow-card-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-secondary">{c.label}</span>
              <Icon className="w-4 h-4 text-muted" />
            </div>
            <div className="text-xl font-semibold text-primary tnum tracking-tight">{formatValue(c)}</div>
            {change !== null && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${positive ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {positive ? <TrendingUp className="w-3 h-3" /> : change === 0 ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{formatChange(change)}</span>
                <span className="text-muted font-normal ml-0.5">vs prev period</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
