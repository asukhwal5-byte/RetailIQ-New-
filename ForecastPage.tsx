import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { uniqueValues, ALL_FILTER } from '@/analytics/aggregations';
import { forecastDemand } from '@/analytics/forecasting';
import { Card, ChartTitle, EmptyState, Badge } from '@/components/ui';
import { formatNumber, tooltipOrNull } from '@/utils/format';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { LineChart as LineIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export function ForecastPage() {
  const { records } = useData();
  const categories = useMemo(() => ['all', ...uniqueValues(records.map((r) => r.category))], [records]);
  const products = useMemo(() => ['all', ...uniqueValues(records.map((r) => r.product))], [records]);

  const [category, setCategory] = useState('all');
  const [product, setProduct] = useState('all');
  const [periods, setPeriods] = useState(6);
  const [unit, setUnit] = useState<'monthly' | 'weekly'>('monthly');

  const result = useMemo(() => forecastDemand(records, { product, category }, periods, unit), [records, product, category, periods, unit]);

  if (records.length === 0) {
    return <EmptyState icon={<LineIcon className="w-10 h-10" />} title="No data available" message="Upload data or load the sample dataset to forecast demand." />;
  }

  const trendIcon = result.trend === 'Upward' ? TrendingUp : result.trend === 'Downward' ? TrendingDown : Minus;
  const trendTone = result.trend === 'Upward' ? 'text-success-600 dark:text-success-400' : result.trend === 'Downward' ? 'text-danger-600 dark:text-danger-400' : 'text-secondary';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <LineIcon className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Demand Forecast</h1>
          <p className="text-sm text-secondary mt-0.5">Holt's linear exponential smoothing — level + trend — on historical units sold.</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring">
              {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Product</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring">
              {products.map((p) => <option key={p} value={p}>{p === 'all' ? 'All products' : p}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Forecast period</label>
            <select value={periods} onChange={(e) => setPeriods(Number(e.target.value))} className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring">
              {[3, 6, 9, 12].map((p) => <option key={p} value={p}>{p} {unit === 'monthly' ? 'months' : 'weeks'}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Granularity</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as 'monthly' | 'weekly')} className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Forecast total ({periods} {unit === 'monthly' ? 'mo' : 'wk'})</div>
          <div className="text-xl font-semibold text-primary tnum">{formatNumber(result.forecastTotal)} <span className="text-xs text-muted font-normal">units</span></div>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Expected range (95%)</div>
          <div className="text-xl font-semibold text-primary tnum">{formatNumber(result.forecastLower)}–{formatNumber(result.forecastUpper)}</div>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Trend</div>
          <div className={`text-xl font-semibold flex items-center gap-1.5 ${trendTone}`}>
            {(() => { const Icon = trendIcon; return <Icon className="w-5 h-5" />; })()}
            {result.trend}
          </div>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4 shadow-card">
          <div className="text-xs font-medium text-secondary mb-1">Model accuracy (RMSE)</div>
          <div className="text-xl font-semibold text-primary tnum">{result.rmse} <span className="text-xs text-muted font-normal">units</span></div>
        </div>
      </div>

      <Card>
        <ChartTitle title="Historical Demand vs Forecast" subtitle="Actual (area) and forecast (line) with the transition marked" />
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={result.history} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1870f5" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1870f5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tickFormatter={(v) => formatNumber(v)} tickLine={false} axisLine={false} width={48} />
            <Tooltip formatter={tooltipOrNull} />
            <Legend />
            <Area type="monotone" dataKey="actual" name="Actual" stroke="#1870f5" strokeWidth={2} fill="url(#gHist)" connectNulls />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#f98c0c" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} connectNulls />
            <ReferenceLine x={result.history.find((h) => h.actual === null)?.label} stroke="#94a3b8" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Forecasting methodology</h3>
            <p className="text-sm text-secondary mb-3">Method: {result.method}. Smoothing factor α = {result.alpha} (level), β = 0.2 (trend).</p>
            <div className="text-sm text-secondary space-y-2">
              <p><strong className="text-primary">Holt's linear method</strong> maintains a level term and a trend (slope) term, updated each period:</p>
              <p className="font-mono text-xs bg-subtle border border-app rounded-lg p-3">Level:  L<sub>t</sub> = α · x<sub>t</sub> + (1 − α) · (L<sub>t−1</sub> + T<sub>t−1</sub>)<br />Trend: T<sub>t</sub> = β · (L<sub>t</sub> − L<sub>t−1</sub>) + (1 − β) · T<sub>t−1</sub><br />Forecast: F<sub>t+h</sub> = L<sub>t</sub> + h · T<sub>t</sub></p>
              <p>The <strong className="text-primary">expected range</strong> is a 95% interval: forecast ± 1.96 × RMSE of in-sample residuals (RMSE = {result.rmse} units).</p>
              <p className="text-xs text-muted">This is a transparent, explainable forecasting method — not a black-box ML model. It captures level and trend but does not model seasonality; interpret ranges as estimates, not guarantees.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
