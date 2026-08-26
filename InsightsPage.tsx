import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { applyFilters, uniqueValues } from '@/analytics/aggregations';
import { generateInsights, simulateScenario } from '@/analytics/insights';
import { productPerformance } from '@/analytics/products';
import { Card, EmptyState, Badge } from '@/components/ui';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import {
  Lightbulb, Sliders, TrendingUp, TrendingDown, AlertTriangle, Info,
  CheckCircle2, ArrowRight, Calculator,
} from 'lucide-react';

const TONE: Record<string, { tone: 'positive' | 'warning' | 'critical' | 'opportunity'; icon: typeof Lightbulb; ring: string; bg: string }> = {
  positive: { tone: 'positive', icon: CheckCircle2, ring: 'border-success-300 dark:border-success-800', bg: 'bg-success-50 dark:bg-success-950/30' },
  warning: { tone: 'warning', icon: AlertTriangle, ring: 'border-warning-300 dark:border-warning-800', bg: 'bg-warning-50 dark:bg-warning-950/30' },
  critical: { tone: 'critical', icon: AlertTriangle, ring: 'border-danger-300 dark:border-danger-800', bg: 'bg-danger-50 dark:bg-danger-950/30' },
  opportunity: { tone: 'opportunity', icon: Lightbulb, ring: 'border-brand-300 dark:border-brand-800', bg: 'bg-brand-50 dark:bg-brand-950/30' },
};

export function InsightsPage() {
  const { records, filters } = useData();
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);
  const insights = useMemo(() => generateInsights(filtered), [filtered]);

  // What-if simulator state
  const products = useMemo(() => productPerformance(filtered), [filtered]);
  const productNames = useMemo(() => products.map((p) => p.product), [products]);
  const [selected, setSelected] = useState(productNames[0] ?? '');
  const baseline = products.find((p) => p.product === selected) ?? products[0];

  const avgPrice = baseline ? baseline.revenue / Math.max(1, baseline.unitsSold) : 0;
  const avgCost = baseline ? baseline.cost / Math.max(1, baseline.unitsSold) : 0;

  const [price, setPrice] = useState(avgPrice);
  const [cost, setCost] = useState(avgCost);
  const [volume, setVolume] = useState(baseline?.unitsSold ?? 0);
  const [discount, setDiscount] = useState(0);
  const [fixedCost, setFixedCost] = useState(20000);

  // When product changes, reset sliders to baseline
  const applyBaseline = () => {
    setPrice(avgPrice);
    setCost(avgCost);
    setVolume(baseline?.unitsSold ?? 0);
    setDiscount(0);
  };

  const current = simulateScenario({ price: avgPrice, cost: avgCost, volume: baseline?.unitsSold ?? 0, discountPct: 0, fixedCost });
  const simulated = simulateScenario({ price, cost, volume, discountPct: discount, fixedCost });

  const profitDelta = simulated.profit - current.profit;

  if (filtered.length === 0) {
    return <EmptyState icon={<Lightbulb className="w-10 h-10" />} title="No data for current filters" message="Adjust filters to generate business insights." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Lightbulb className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Decision Center</h1>
          <p className="text-sm text-secondary mt-0.5">Actionable, evidence-based business insights — not a restatement of dashboard numbers.</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <Card><EmptyState icon={<Lightbulb className="w-10 h-10" />} title="No notable insights" message="The current data scope did not surface any concentration, margin, stock or growth signals worth flagging." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((ins) => {
            const cfg = TONE[ins.tone];
            const Icon = cfg.icon;
            return (
              <div key={ins.id} className={`border ${cfg.ring} ${cfg.bg} rounded-xl p-5`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    ins.tone === 'positive' ? 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300' :
                    ins.tone === 'warning' ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300' :
                    ins.tone === 'critical' ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300' :
                    'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-primary">{ins.title}</h3>
                    <Badge tone={ins.tone === 'positive' ? 'success' : ins.tone === 'warning' ? 'warning' : ins.tone === 'critical' ? 'danger' : 'info'}>{ins.evidence}</Badge>
                  </div>
                </div>
                <p className="text-sm text-primary mb-3">{ins.insight}</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-secondary uppercase tracking-wide">Why it matters</span>
                    <p className="text-secondary mt-0.5">{ins.whyItMatters}</p>
                  </div>
                  <div className="pt-2 border-t border-app/60">
                    <span className="font-semibold text-secondary uppercase tracking-wide">Recommended action</span>
                    <p className="text-secondary mt-0.5">{ins.recommendedAction}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* What-If Scenario Simulator */}
      <div className="flex items-center gap-2.5 pt-2">
        <Sliders className="w-5 h-5 text-brand-500" />
        <div>
          <h2 className="text-xl font-semibold text-primary tracking-tight">Scenario Simulator</h2>
          <p className="text-sm text-secondary mt-0.5">Adjust price, cost, volume and discount to model profit impact. Simulations — not guaranteed predictions.</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-primary">Parameters</h3>
              <div className="flex items-center gap-2">
                <select value={selected} onChange={(e) => { setSelected(e.target.value); setTimeout(applyBaseline, 0); }} className="bg-surface border border-app rounded-lg px-2.5 py-1.5 text-xs text-primary focus-ring">
                  {productNames.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={applyBaseline} className="text-xs px-2.5 py-1.5 rounded-lg bg-subtle border border-app text-secondary hover:text-primary focus-ring">Reset</button>
              </div>
            </div>

            <Slider label="Selling price (₹)" value={price} min={0} max={Math.max(avgPrice * 2, 1000)} step={1} onChange={setPrice} format={(v) => `₹${v.toFixed(0)}`} />
            <Slider label="Cost price (₹)" value={cost} min={0} max={Math.max(avgPrice * 1.5, 800)} step={1} onChange={setCost} format={(v) => `₹${v.toFixed(0)}`} />
            <Slider label="Sales volume (units)" value={volume} min={0} max={Math.max((baseline?.unitsSold ?? 0) * 2, 100)} step={1} onChange={setVolume} format={(v) => `${v.toLocaleString()}`} />
            <Slider label="Discount (%)" value={discount} min={0} max={50} step={1} onChange={setDiscount} format={(v) => `${v}%`} />
            <Slider label="Fixed cost (₹)" value={fixedCost} min={0} max={100000} step={1000} onChange={setFixedCost} format={(v) => `₹${v.toLocaleString()}`} />
          </div>

          {/* Comparison */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-subtle border border-app rounded-lg p-4">
                <div className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Current</div>
                <ResultRow label="Revenue" value={formatCurrency(current.revenue)} />
                <ResultRow label="Cost" value={formatCurrency(current.cost)} />
                <ResultRow label="Profit" value={formatCurrency(current.profit)} />
                <ResultRow label="Margin" value={formatPercent(current.margin)} />
                <ResultRow label="Break-even" value={`${formatNumber(current.breakEvenUnits)} units`} />
              </div>
              <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
                <div className="text-xs font-medium text-brand-700 dark:text-brand-300 mb-2 uppercase tracking-wide">Simulated</div>
                <ResultRow label="Revenue" value={formatCurrency(simulated.revenue)} />
                <ResultRow label="Cost" value={formatCurrency(simulated.cost)} />
                <ResultRow label="Profit" value={formatCurrency(simulated.profit)} />
                <ResultRow label="Margin" value={formatPercent(simulated.margin)} />
                <ResultRow label="Break-even" value={`${formatNumber(simulated.breakEvenUnits)} units`} />
              </div>
            </div>

            <div className={`rounded-lg p-4 border ${profitDelta >= 0 ? 'bg-success-50 dark:bg-success-950/30 border-success-200 dark:border-success-800' : 'bg-danger-50 dark:bg-danger-950/30 border-danger-200 dark:border-danger-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                {profitDelta >= 0 ? <TrendingUp className="w-4 h-4 text-success-600 dark:text-success-400" /> : <TrendingDown className="w-4 h-4 text-danger-600 dark:text-danger-400" />}
                <span className={`text-sm font-semibold ${profitDelta >= 0 ? 'text-success-700 dark:text-success-300' : 'text-danger-700 dark:text-danger-300'}`}>
                  Profit {profitDelta >= 0 ? 'increases' : 'decreases'} by {formatCurrency(Math.abs(profitDelta))}
                </span>
              </div>
              <p className="text-xs text-secondary">
                {discount > 0 && `At ${discount}% discount, `}
                {price !== avgPrice && `selling price ${price > avgPrice ? '↑' : '↓'} ${formatPercent(Math.abs((price - avgPrice) / avgPrice) * 100)}, `}
                {volume !== (baseline?.unitsSold ?? 0) && `volume ${volume > (baseline?.unitsSold ?? 0) ? '↑' : '↓'} ${formatPercent(Math.abs((volume - (baseline?.unitsSold ?? 0)) / Math.max(1, baseline?.unitsSold ?? 1)) * 100)}, `}
                estimated profit changes from {formatCurrency(current.profit)} to {formatCurrency(simulated.profit)}.
              </p>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted bg-subtle border border-app rounded-lg p-3">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Break-even units = fixed cost ÷ (effective price − variable cost). This is a linear model and does not account for demand elasticity — a real price increase may reduce volume.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-2.5">
          <Calculator className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">How insights are generated</h3>
            <p className="text-sm text-secondary">Each insight is computed from the filtered dataset using portfolio share, margin averages, inventory cover days, and period-over-period growth. Every card shows the evidence used and a concrete recommended action — no number is hardcoded.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-secondary">{label}</span>
      <span className="text-sm font-semibold text-primary tnum">{value}</span>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-secondary">{label}</label>
        <span className="text-xs font-semibold text-primary tnum">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600 cursor-pointer"
      />
    </div>
  );
}
