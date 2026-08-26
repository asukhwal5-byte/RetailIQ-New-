import type { SalesRecord } from '@/types';
import { getStockLevel, avgDailySalesByProduct } from './products';
import { round } from './stats';

export type InventoryRisk = 'HIGH' | 'MEDIUM' | 'LOW';

export interface InventoryItem {
  product: string;
  category: string;
  currentStock: number;
  avgDailySales: number;
  daysRemaining: number;
  reorderPoint: number;
  risk: InventoryRisk;
  status: 'CRITICAL' | 'LOW STOCK' | 'HEALTHY' | 'OVERSTOCKED';
  recommendedAction: string;
}

/**
 * Inventory intelligence.
 * - Average daily sales = total units sold / date span days.
 * - Estimated days remaining = current stock / avg daily sales.
 * - Reorder point = avg daily sales * lead time (7 days) + safety stock (1 week of demand).
 * - Risk classification from days remaining.
 */
export function inventoryAnalysis(records: SalesRecord[]): InventoryItem[] {
  const dailyMap = avgDailySalesByProduct(records);
  const categoryOf = new Map<string, string>();
  for (const r of records) categoryOf.set(r.product, r.category);

  const items: InventoryItem[] = [];
  for (const [product, avgDaily] of dailyMap) {
    const stock = getStockLevel(product);
    const daysRemaining = avgDaily > 0 ? stock / avgDaily : Infinity;
    const leadTime = 7;
    const safetyStock = avgDaily * 7;
    const reorderPoint = Math.ceil(avgDaily * leadTime + safetyStock);

    let risk: InventoryRisk = 'LOW';
    let status: InventoryItem['status'] = 'HEALTHY';
    let action = 'Monitor — no action needed.';

    if (!isFinite(daysRemaining) || daysRemaining > 90) {
      status = 'OVERSTOCKED';
      risk = 'MEDIUM';
      action = 'Reduce reorder quantity; run a promotion to clear excess stock.';
    } else if (daysRemaining < 7) {
      status = 'CRITICAL';
      risk = 'HIGH';
      action = 'Reorder immediately — stock-out imminent.';
    } else if (daysRemaining < 21) {
      status = 'LOW STOCK';
      risk = 'HIGH';
      action = 'Place reorder now to avoid stock-out within 3 weeks.';
    } else if (daysRemaining < 35) {
      risk = 'MEDIUM';
      action = 'Plan a reorder within the next replenishment cycle.';
    }

    items.push({
      product,
      category: categoryOf.get(product) ?? '—',
      currentStock: stock,
      avgDailySales: round(avgDaily, 1),
      daysRemaining: round(isFinite(daysRemaining) ? daysRemaining : 999, 1),
      reorderPoint,
      risk,
      status,
      recommendedAction: action,
    });
  }

  return items.sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
    return order[a.risk] - order[b.risk];
  });
}

export function priorityReorderList(items: InventoryItem[]): InventoryItem[] {
  return items.filter((i) => i.risk === 'HIGH' || i.risk === 'MEDIUM');
}
