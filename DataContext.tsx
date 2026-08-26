import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { RawSalesRow, SalesRecord, Filters } from '@/types';
import { generateSampleData } from '@/data/sampleData';
import { enrichRows, defaultFilters } from '@/analytics/aggregations';

interface DataCtx {
  raw: RawSalesRow[];
  records: SalesRecord[];
  setData: (rows: RawSalesRow[], name?: string) => void;
  resetToSample: () => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  source: 'sample' | 'uploaded';
  fileName: string | null;
}

const DataContext = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const initialSample = useMemo(() => generateSampleData(), []);
  const [raw, setRaw] = useState<RawSalesRow[]>(initialSample);
  const [source, setSource] = useState<'sample' | 'uploaded'>('sample');
  const [fileName, setFileName] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(enrichRows(initialSample)));

  const records = useMemo(() => enrichRows(raw), [raw]);

  const setData = (rows: RawSalesRow[], name?: string) => {
    setRaw(rows);
    setSource('uploaded');
    setFileName(name ?? 'uploaded.csv');
    setFilters(defaultFilters(enrichRows(rows)));
  };

  const resetToSample = () => {
    const sample = generateSampleData();
    setRaw(sample);
    setSource('sample');
    setFileName(null);
    setFilters(defaultFilters(enrichRows(sample)));
  };

  return (
    <DataContext.Provider value={{ raw, records, setData, resetToSample, filters, setFilters, source, fileName }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
