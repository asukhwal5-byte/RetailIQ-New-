import { useData } from '@/context/DataContext';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui';
import { Settings as SettingsIcon, Moon, Sun, Database, RotateCcw, Info } from 'lucide-react';
import { formatNumber } from '@/utils/format';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { records, source, resetToSample, fileName } = useData();

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2.5">
        <SettingsIcon className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-secondary mt-0.5">Appearance, data source and application information.</p>
        </div>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-primary mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-brand-500" />}
            <div>
              <div className="text-sm font-medium text-primary">Theme</div>
              <div className="text-xs text-secondary">Currently using {theme} theme</div>
            </div>
          </div>
          <button onClick={toggleTheme} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 focus-ring">
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-primary mb-4">Data source</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-accent-500" />
            <div>
              <div className="text-sm font-medium text-primary">{source === 'sample' ? 'Sample dataset' : 'Uploaded dataset'}</div>
              <div className="text-xs text-secondary">{fileName ?? 'Built-in generated sample'} · {formatNumber(records.length)} rows</div>
            </div>
          </div>
          <button onClick={resetToSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-app text-sm font-medium text-secondary hover:text-primary focus-ring">
            <RotateCcw className="w-4 h-4" /> Reset to sample
          </button>
        </div>
        <p className="text-xs text-muted">All analytics, KPIs, forecasts, inventory and insights are calculated live from this dataset. No values are hardcoded.</p>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">About RetailIQ</h3>
            <p className="text-sm text-secondary mb-3">RetailIQ is an end-to-end retail analytics platform that turns raw sales data into actionable decisions — revenue, profit, inventory, demand forecasting, anomaly detection and business insights.</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-subtle border border-app rounded-lg p-3">
                <div className="text-muted uppercase tracking-wide font-medium">Technologies</div>
                <div className="text-secondary mt-1">React, TypeScript, Vite, Tailwind CSS, Recharts, PapaParse</div>
              </div>
              <div className="bg-subtle border border-app rounded-lg p-3">
                <div className="text-muted uppercase tracking-wide font-medium">Methods</div>
                <div className="text-secondary mt-1">Exponential smoothing, Z-score, IQR, break-even, correlation, moving average</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
