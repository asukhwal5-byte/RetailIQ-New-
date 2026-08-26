import type { SalesRecord } from '@/types';
import { aggregateByCategory, aggregateByRegion, monthlySeries, aggregateByCustomer } from './aggregations';
import { productPerformance } from './products';
import { inventoryAnalysis } from './inventory';
import { pctChange, round } from './stats';

export interface Insight {
  id: string;
  title: string;
  insight: string;
  whyItMatters: string;
  recommendedAction: string;
  evidence: string;
  tone: 'positive' | 'warning' | 'critical' | 'opportunity';
}

/**
 * Decision Center — derives actionable insights from computed analytics rather
 * than restating dashboard numbers. Each insight carries evidence and a concrete
 * recommended action.
 */
export function generateInsights(records: SalesRecord[]): Insight[] {
  if (records.length === 0) return [];
  const insights: Insight[] = [];

  // 1. Profit concentration — does a single product dominate profit?
  const products = productPerformance(records);
  const totalProfit = products.reduce((s, p) => s + p.profit, 0);
  const totalUnits = products.reduce((s, p) => s + p.unitsSold, 0);
  if (products.length > 0 && totalProfit > 0) {
    const top = products[0];
    const profitShare = (top.profit / totalProfit) * 100;
    const unitShare = (top.unitsSold / totalUnits) * 100;
    if (profitShare > 20) {
      insights.push({
        id: 'profit-concentration',
        title: 'Profit concentration risk',
        insight: `${top.product} generates ${round(profitShare, 1)}% of total profit while representing only ${round(unitShare, 1)}% of units sold.`,
        whyItMatters: 'Heavy dependence on one product means a supply disruption, price cut, or demand shift could materially hurt overall profitability.',
        recommendedAction: 'Diversify the profitable product mix — promote the next tier of high-margin products and negotiate backup supply for this item.',
        evidence: `Profit share ${round(profitShare, 1)}% vs unit share ${round(unitShare, 1)}%`,
        tone: profitShare > 35 ? 'critical' : 'warning',
      });
    }
  }

  // 2. High volume, low margin category.
  const cats = aggregateByCategory(records);
  const avgMargin = cats.reduce((s, c) => s + c.margin, 0) / cats.length;
  for (const c of cats) {
    if (c.units > 0 && c.margin < avgMargin * 0.75 && c.revenue > totalProfit * 0.1) {
      insights.push({
        id: `low-margin-${c.category}`,
        title: `${c.category}: high volume, thin margin`,
        insight: `${c.category} has strong sales volume (${c.units.toLocaleString()} units) but a profit margin of ${c.margin}%, which is ${round(avgMargin - c.margin, 1)} pts below the portfolio average.`,
        whyItMatters: 'Revenue looks healthy but contribution to profit is disproportionately small — working capital is tied up in low-return SKUs.',
        recommendedAction: 'Review supplier costs and pricing for this category; consider selective price increases or phase out the lowest-margin SKUs.',
        evidence: `Margin ${c.margin}% vs avg ${round(avgMargin, 1)}% on ${c.units.toLocaleString()} units`,
        tone: 'warning',
      });
    }
  }

  // 3. Stock-out risk from inventory.
  const inv = inventoryAnalysis(records);
  const critical = inv.filter((i) => i.status === 'CRITICAL');
  for (const item of critical.slice(0, 2)) {
    insights.push({
      id: `stockout-${item.product}`,
      title: `Stock-out risk: ${item.product}`,
      insight: `${item.product} has ~${item.daysRemaining} days of inventory left at the current average daily sales rate of ${item.avgDailySales} units/day.`,
      whyItMatters: 'Continued demand will exhaust stock before a typical replenishment cycle completes, causing lost revenue and customer churn.',
      recommendedAction: item.recommendedAction,
      evidence: `Stock ${item.currentStock} / avg daily ${item.avgDailySales} / days left ${item.daysRemaining}`,
      tone: 'critical',
    });
  }

  // 4. Overstock tied-up capital.
  const over = inv.filter((i) => i.status === 'OVERSTOCKED');
  for (const item of over.slice(0, 1)) {
    insights.push({
      id: `overstock-${item.product}`,
      title: `Overstock: ${item.product}`,
      insight: `${item.product} has ${item.currentStock} units in stock — roughly ${item.daysRemaining} days of cover, well above the healthy 30–60 day range.`,
      whyItMatters: 'Excess inventory ties up working capital and risks obsolescence, especially for seasonal items.',
      recommendedAction: 'Run a clearance promotion or bundle this product with a fast mover to reduce stock within 30 days.',
      evidence: `Days of cover ${item.daysRemaining} vs healthy ≤60`,
      tone: 'opportunity',
    });
  }

  // 5. Fastest growing region.
  const monthly = monthlySeries(records);
  const regionSeries = new Map<string, { prev: number; curr: number; region: string }>();
  const midDate = records.length > 0
    ? records.sort((a, b) => a.date.localeCompare(b.date))[Math.floor(records.length / 2)].date
    : '';
  for (const r of records) {
    const rs = regionSeries.get(r.region) ?? { prev: 0, curr: 0, region: r.region };
    if (r.date < midDate) rs.prev += r.revenue;
    else rs.curr += r.revenue;
    regionSeries.set(r.region, rs);
  }
  const regionGrowths = [...regionSeries.values()]
    .map((v) => ({ region: v.region, growth: pctChange(v.prev, v.curr) }))
    .filter((v): v is { region: string; growth: number } => v.growth !== null)
    .sort((a, b) => b.growth - a.growth);
  if (regionGrowths.length > 0 && regionGrowths[0].growth > 10) {
    const top = regionGrowths[0];
    insights.push({
      id: 'top-region-growth',
      title: `${top.region} is the fastest-growing region`,
      insight: `${top.region} shows ${round(top.growth, 1)}% revenue growth comparing the recent half vs the earlier half of the dataset.`,
      whyItMatters: 'Regional momentum signals where demand is accelerating — a good place to concentrate marketing and inventory investment.',
      recommendedAction: `Increase marketing spend and stock allocation in ${top.region}; investigate the driver (new customer, promo, seasonality) to replicate elsewhere.`,
      evidence: `Revenue growth ${round(top.growth, 1)}% vs prior period`,
      tone: 'positive',
    });
  }

  // 6. High-value customer concentration.
  const customers = aggregateByCustomer(records);
  const totalCustRevenue = customers.reduce((s, c) => s + c.revenue, 0);
  if (customers.length > 0 && totalCustRevenue > 0) {
    const top3Share = customers.slice(0, 3).reduce((s, c) => s + c.revenue, 0) / totalCustRevenue * 100;
    if (top3Share > 30) {
      insights.push({
        id: 'customer-concentration',
        title: 'Customer concentration risk',
        insight: `The top 3 customers contribute ${round(top3Share, 1)}% of total revenue — reliance on a few accounts is high.`,
        whyItMatters: 'Losing one major customer could cause a sharp revenue drop; relationship continuity is a key risk.',
        recommendedAction: 'Strengthen retention with the top accounts while actively acquiring new customers to broaden the base.',
        evidence: `Top-3 revenue share ${round(top3Share, 1)}%`,
        tone: 'warning',
      });
    }
  }

  // 7. Slow-moving product.
  const slow = products.find((p) => p.badges.includes('SLOW_MOVING'));
  if (slow) {
    insights.push({
      id: `slow-${slow.product}`,
      title: `Slow mover: ${slow.product}`,
      insight: `${slow.product} sold only ${slow.unitsSold} units across the period — well below the portfolio's fast movers.`,
      whyItMatters: 'Slow velocity locks inventory and storage cost without generating proportional revenue.',
      recommendedAction: 'Bundle with a best-seller, discount to clear, or discontinue if margin is also weak.',
      evidence: `${slow.unitsSold} units vs portfolio max ${products[0].unitsSold}`,
      tone: 'opportunity',
    });
  }

  return insights;
}

export interface ScenarioResult {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  breakEvenUnits: number;
}

/**
 * What-if scenario simulator. Given a product baseline, let the user change
 * price, cost, volume and discount; compute revenue, profit, margin and
 * break-even for current vs simulated scenarios.
 */
export function simulateScenario(params: {
  price: number;
  cost: number;
  volume: number;
  discountPct: number;
  fixedCost: number;
}): ScenarioResult {
  const effectivePrice = params.price * (1 - params.discountPct / 100);
  const revenue = effectivePrice * params.volume;
  const cost = params.cost * params.volume + params.fixedCost;
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const contribution = effectivePrice - params.cost;
  const breakEvenUnits = contribution > 0 ? params.fixedCost / contribution : Infinity;
  return {
    revenue: round(revenue),
    cost: round(cost),
    profit: round(profit),
    margin: round(margin),
    breakEvenUnits: round(isFinite(breakEvenUnits) ? breakEvenUnits : 0),
  };
}
