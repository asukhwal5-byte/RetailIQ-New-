import Papa from 'papaparse';
import type { RawSalesRow, ValidationResult, DataIssue } from '@/types';

const EXPECTED = ['Date', 'Product', 'Category', 'Quantity', 'SellingPrice', 'CostPrice', 'Region', 'Customer'];
const ALIASES: Record<string, string> = {
  date: 'Date', day: 'Date',
  product: 'Product', item: 'Product', sku: 'Product',
  category: 'Category', dept: 'Category', department: 'Category',
  quantity: 'Quantity', qty: 'Quantity', units: 'Quantity',
  sellingprice: 'SellingPrice', price: 'SellingPrice', saleprice: 'SellingPrice', unitprice: 'SellingPrice',
  costprice: 'CostPrice', cost: 'CostPrice', unitcost: 'CostPrice',
  region: 'Region', area: 'Region', location: 'Region',
  customer: 'Customer', client: 'Customer', buyer: 'Customer',
};

function normalizeHeader(h: string): string {
  const key = h.trim().toLowerCase().replace(/[\s_]/g, '');
  return ALIASES[key] ?? h.trim();
}

/**
 * Parse and validate an uploaded CSV file.
 * Steps: normalize headers, validate columns, detect missing values,
 * invalid numbers, invalid dates, and duplicate rows. Returns a data-quality
 * summary plus the cleaned rows that passed validation.
 */
export function parseCsv(file: File, onComplete: (result: ValidationResult) => void, onError: (msg: string) => void) {
  Papa.parse<Record<string, string>>(file, {
    header: true,
    skipEmptyLines: true,
    complete: (parsed) => {
      if (!parsed.data || parsed.data.length === 0) {
        onError('The uploaded file appears to be empty.');
        return;
      }
      const rawHeaders = parsed.meta.fields ?? Object.keys(parsed.data[0]);
      const normalized = rawHeaders.map(normalizeHeader);

      const issues: DataIssue[] = [];
      const missing = EXPECTED.filter((h) => !normalized.includes(h));
      if (missing.length > 0) {
        for (const h of missing) {
          issues.push({ row: 0, field: h, type: 'invalid_column', message: `Missing required column: ${h}` });
        }
      }

      const idx: Record<string, number> = {};
      EXPECTED.forEach((h) => {
        const i = normalized.indexOf(h);
        if (i >= 0) idx[h] = i;
      });

      const cleanRows: RawSalesRow[] = [];
      const seen = new Set<string>();
      let duplicates = 0;
      let missingValues = 0;
      let invalidRows = 0;

      parsed.data.forEach((row, i) => {
        const sourceRow = i + 2; // header is row 1
        const get = (h: string) => (idx[h] !== undefined ? String(row[rawHeaders[idx[h]]] ?? '').trim() : '');
        const dateStr = get('Date');
        const product = get('Product');
        const category = get('Category');
        const qtyStr = get('Quantity');
        const priceStr = get('SellingPrice');
        const costStr = get('CostPrice');
        const region = get('Region');
        const customer = get('Customer');

        let rowInvalid = false;

        // Missing values
        for (const [h, v] of [['Date', dateStr], ['Product', product], ['Category', category], ['Quantity', qtyStr], ['SellingPrice', priceStr], ['CostPrice', costStr], ['Region', region], ['Customer', customer]] as [string, string][]) {
          if (v === '') {
            missingValues++;
            issues.push({ row: sourceRow, field: h, type: 'missing', message: `Row ${sourceRow}: ${h} is empty` });
            rowInvalid = true;
          }
        }

        // Date validation
        const dateObj = new Date(dateStr);
        if (dateStr && isNaN(dateObj.getTime())) {
          issues.push({ row: sourceRow, field: 'Date', type: 'invalid_date', message: `Row ${sourceRow}: invalid date "${dateStr}"` });
          rowInvalid = true;
        }

        // Numeric validation
        const qty = Number(qtyStr);
        const price = Number(priceStr);
        const cost = Number(costStr);
        if (qtyStr && (isNaN(qty) || qty < 0)) {
          issues.push({ row: sourceRow, field: 'Quantity', type: 'invalid_number', message: `Row ${sourceRow}: Quantity "${qtyStr}" is not a valid non-negative number` });
          rowInvalid = true;
        }
        if (priceStr && (isNaN(price) || price < 0)) {
          issues.push({ row: sourceRow, field: 'SellingPrice', type: 'invalid_number', message: `Row ${sourceRow}: SellingPrice "${priceStr}" is invalid` });
          rowInvalid = true;
        }
        if (costStr && (isNaN(cost) || cost < 0)) {
          issues.push({ row: sourceRow, field: 'CostPrice', type: 'invalid_number', message: `Row ${sourceRow}: CostPrice "${costStr}" is invalid` });
          rowInvalid = true;
        }

        if (rowInvalid) {
          invalidRows++;
          return;
        }

        // Duplicate detection on full row signature
        const sig = `${dateStr}|${product}|${category}|${qty}|${price}|${cost}|${region}|${customer}`;
        if (seen.has(sig)) {
          duplicates++;
          issues.push({ row: sourceRow, field: '__row__', type: 'duplicate', message: `Row ${sourceRow}: duplicate of an earlier row` });
          return;
        }
        seen.add(sig);

        cleanRows.push({
          date: dateObj.toISOString().slice(0, 10),
          product,
          category,
          quantity: qty,
          sellingPrice: price,
          costPrice: cost,
          region,
          customer,
        });
      });

      const validRows = cleanRows.length;
      onComplete({
        totalRows: parsed.data.length,
        validRows,
        invalidRows,
        duplicates,
        missingValues,
        issues,
        cleanRows,
      });
    },
    error: (err) => onError(err.message),
  });
}

/** Convert rows to a CSV string for download. */
export function rowsToCsv(rows: RawSalesRow[]): string {
  const header = 'Date,Product,Category,Quantity,SellingPrice,CostPrice,Region,Customer';
  const body = rows.map((r) =>
    [r.date, escapeCsv(r.product), escapeCsv(r.category), r.quantity, r.sellingPrice, r.costPrice, escapeCsv(r.region), escapeCsv(r.customer)].join(','),
  );
  return [header, ...body].join('\n');
}

function escapeCsv(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
