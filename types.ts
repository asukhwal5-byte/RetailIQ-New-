export type CustomerSegment = 'Retail' | 'Wholesale' | 'Online' | 'Corporate';

export interface RawSalesRow {
  date: string;          // ISO yyyy-mm-dd
  product: string;
  category: string;
  quantity: number;
  sellingPrice: number;  // per unit
  costPrice: number;     // per unit
  region: string;
  customer: string;
}

export interface SalesRecord extends RawSalesRow {
  id: number;
  dateObj: Date;
  revenue: number;     // quantity * sellingPrice
  cost: number;        // quantity * costPrice
  profit: number;      // revenue - cost
  margin: number;      // profit / revenue
  monthKey: string;    // yyyy-mm
  segment: CustomerSegment;
}

export interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  missingValues: number;
  issues: DataIssue[];
  cleanRows: RawSalesRow[];
}

export interface DataIssue {
  row: number;        // 1-indexed source row
  field: string;
  type: 'missing' | 'invalid_number' | 'invalid_date' | 'invalid_column' | 'duplicate';
  message: string;
}

export interface Filters {
  dateFrom: string;
  dateTo: string;
  category: string;   // 'all' or category name
  product: string;    // 'all' or product name
  region: string;     // 'all' or region
  segment: string;    // 'all' or segment
}

export interface KpiCard {
  label: string;
  value: number;
  format: 'currency' | 'percent' | 'number';
  change: number | null;     // percent change vs previous period
}
