import type { Filters } from '@/types';
import { ALL_FILTER } from '@/analytics/aggregations';
import { uniqueValues } from '@/analytics/aggregations';
import type { SalesRecord } from '@/types';
import { Calendar, Tag, Package, MapPin, Users } from 'lucide-react';

interface Props {
  records: SalesRecord[];
  filters: Filters;
  onChange: (f: Filters) => void;
  compact?: boolean;
}

function SelectField({ icon, label, value, options, onChange }: { icon: React.ReactNode; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring"
      >
        <option value={ALL_FILTER}>All {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({ records, filters, onChange, compact }: Props) {
  const categories = uniqueValues(records.map((r) => r.category));
  const products = uniqueValues(records.map((r) => r.product));
  const regions = uniqueValues(records.map((r) => r.region));
  const segments = uniqueValues(records.map((r) => r.segment));

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className={`bg-surface border border-app rounded-xl p-4 shadow-card ${compact ? '' : 'mb-5'}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />From</label>
          <input type="date" value={filters.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />To</label>
          <input type="date" value={filters.dateTo} onChange={(e) => set({ dateTo: e.target.value })} className="bg-surface border border-app rounded-lg px-3 py-2 text-sm text-primary focus-ring" />
        </div>
        <SelectField icon={<Tag className="w-3.5 h-3.5" />} label="Category" value={filters.category} options={categories} onChange={(v) => set({ category: v })} />
        <SelectField icon={<Package className="w-3.5 h-3.5" />} label="Product" value={filters.product} options={products} onChange={(v) => set({ product: v })} />
        <SelectField icon={<MapPin className="w-3.5 h-3.5" />} label="Region" value={filters.region} options={regions} onChange={(v) => set({ region: v })} />
        <SelectField icon={<Users className="w-3.5 h-3.5" />} label="Segment" value={filters.segment} options={segments} onChange={(v) => set({ segment: v })} />
      </div>
    </div>
  );
}
