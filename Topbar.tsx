import { Menu, Search, Database } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface Props {
  title: string;
  onOpenMobile: () => void;
}

export function Topbar({ title, onOpenMobile }: Props) {
  const { source, records } = useData();
  return (
    <header className="h-16 border-b border-app bg-surface flex items-center gap-3 px-4 lg:px-6 shrink-0">
      <button onClick={onOpenMobile} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-subtle text-secondary focus-ring" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>
      <h2 className="text-base font-semibold text-primary tracking-tight truncate">{title}</h2>
      <div className="flex-1" />
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-subtle border border-app">
        <Database className="w-4 h-4 text-muted" />
        <span className="text-xs text-secondary font-medium">
          {source === 'sample' ? 'Sample dataset' : 'Uploaded dataset'} · {records.length.toLocaleString()} rows
        </span>
      </div>
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          placeholder="Search..."
          className="bg-subtle border border-app rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder:text-muted focus-ring w-44"
        />
      </div>
    </header>
  );
}
