import { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { parseCsv } from '@/data/csvParser';
import { generateSampleData, SAMPLE_CSV_HEADERS } from '@/data/sampleData';
import { rowsToCsv } from '@/data/csvParser';
import type { ValidationResult } from '@/types';
import { Card, Badge } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Copy,
  RotateCcw, Download, Sparkles,
} from 'lucide-react';

export function UploadPage() {
  const { setData, resetToSample, source, fileName } = useData();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    setResult(null);
    setLoading(true);
    setUploadedName(file.name);
    parseCsv(
      file,
      (res) => { setResult(res); setLoading(false); },
      (msg) => { setError(msg); setLoading(false); },
    );
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const applyCleaned = () => {
    if (result && result.cleanRows.length > 0) {
      setData(result.cleanRows, uploadedName ?? undefined);
    }
  };

  const downloadSample = () => {
    const sample = generateSampleData();
    const csv = rowsToCsv(sample);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_retail_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_CSV_HEADERS.join(','));
  };

  const stats = result ? [
    { label: 'Total rows', value: result.totalRows, icon: FileSpreadsheet, tone: 'text-primary' },
    { label: 'Valid rows', value: result.validRows, icon: CheckCircle2, tone: 'text-success-600 dark:text-success-400' },
    { label: 'Invalid rows', value: result.invalidRows, icon: XCircle, tone: 'text-danger-600 dark:text-danger-400' },
    { label: 'Duplicates', value: result.duplicates, icon: Copy, tone: 'text-warning-600 dark:text-warning-400' },
    { label: 'Missing values', value: result.missingValues, icon: AlertTriangle, tone: 'text-warning-600 dark:text-warning-400' },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Upload className="w-5 h-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Data Upload</h1>
          <p className="text-sm text-secondary mt-0.5">Upload a CSV to validate, clean and load your own dataset. Expected columns: Date, Product, Category, Quantity, SellingPrice, CostPrice, Region, Customer.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={downloadSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-app text-sm font-medium text-secondary hover:text-primary focus-ring">
          <Download className="w-4 h-4" /> Download sample CSV
        </button>
        <button onClick={copyTemplate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-app text-sm font-medium text-secondary hover:text-primary focus-ring">
          <Copy className="w-4 h-4" /> Copy column template
        </button>
        <button onClick={resetToSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-app text-sm font-medium text-secondary hover:text-primary focus-ring">
          <RotateCcw className="w-4 h-4" /> Reset to sample dataset
        </button>
      </div>

      <Card>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-app-strong rounded-xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-secondary">Validating file…</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-sm font-medium text-primary">Drag & drop a CSV file here, or click to browse</p>
              <p className="text-xs text-muted mt-1">Max size depends on your browser. Headers are case-insensitive; aliases (qty, price, cost, etc.) are accepted.</p>
            </>
          )}
        </div>
        {error && <div className="mt-3 flex items-center gap-2 text-sm text-danger-600 dark:text-danger-400"><XCircle className="w-4 h-4" /> {error}</div>}
        {source === 'uploaded' && !result && (
          <div className="mt-3 flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
            <CheckCircle2 className="w-4 h-4" /> Currently using uploaded file: {fileName}
          </div>
        )}
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-surface border border-app rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-secondary">{s.label}</span>
                    <Icon className={`w-4 h-4 ${s.tone}`} />
                  </div>
                  <div className={`text-xl font-semibold tnum ${s.tone}`}>{formatNumber(s.value)}</div>
                </div>
              );
            })}
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary">Data quality summary</h3>
              {result.cleanRows.length > 0 && (
                <button onClick={applyCleaned} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 focus-ring">
                  <Sparkles className="w-4 h-4" /> Load {formatNumber(result.cleanRows.length)} clean rows
                </button>
              )}
            </div>

            {result.issues.some((i) => i.type === 'invalid_column') && (
              <div className="mb-3 p-3 rounded-lg bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 text-sm text-danger-700 dark:text-danger-300">
                <strong>Missing columns:</strong> {result.issues.filter((i) => i.type === 'invalid_column').map((i) => i.field).join(', ')}
              </div>
            )}

            {result.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
                <CheckCircle2 className="w-4 h-4" /> No issues detected. All rows are valid and ready to load.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="text-left text-muted border-b border-app">
                      <th className="py-2 px-3 font-medium">Row</th>
                      <th className="py-2 px-3 font-medium">Field</th>
                      <th className="py-2 px-3 font-medium">Type</th>
                      <th className="py-2 px-3 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.issues.slice(0, 100).map((issue, i) => (
                      <tr key={i} className="border-b border-app last:border-0">
                        <td className="py-2 px-3 text-secondary tnum">{issue.row}</td>
                        <td className="py-2 px-3 text-secondary">{issue.field}</td>
                        <td className="py-2 px-3"><Badge tone={issue.type === 'duplicate' ? 'warning' : issue.type === 'missing' ? 'warning' : 'danger'}>{issue.type.replace('_', ' ')}</Badge></td>
                        <td className="py-2 px-3 text-secondary text-xs">{issue.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.issues.length > 100 && <p className="text-xs text-muted text-center py-2">Showing first 100 of {result.issues.length} issues.</p>}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
