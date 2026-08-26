import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { anomalySummary, metricLabel, type AnomalyMetric } from '@/analytics/anomalies';
import { Card, EmptyState, Badge } from '@/components/ui';
import { formatCurrency, formatNumber, formatDate } from '@/utils/format';
import { AlertTriangle, Database, Activity } from 'lucide-react';

const METRICS: AnomalyMetric[] = ['quantity', 'revenue', 'sellingPrice', 'orderValue', 'dailyUnits'];

const SEV_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};

export function AnomalyDetectionPage() {
  const { records } = useData();
  const [metric, setMetric] = useState<AnomalyMetric>('dailyUnits');

  const summary = useMemo(() => anomalySummary(records, metric), [records, metric]);

  if (records.length === 0) {
    return <EmptyState icon={<Database className="w-10 h-10" />} title="No data available" message="Load data to run anomaly detection." />;
  }

  const top = summary.anomalies.slice(0, 50);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-5 h-5 text-warning-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Anomaly Detection</h1>
          <p className="text-sm text-secondary mt-0.5">Statistical outliers flagged by Z-score and IQR fences.</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {METRICS.map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-ring
                  ${metric === m ? 'bg-brand-600 text-white' : 'bg-subtle border border-app text-secondary hover:text-primary'}`}
              >
                {metricLabel(m)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Badge tone="danger">High: {summary.high}</Badge>
            <Badge tone="warning">Medium: {summary.med}</Badge>
            <Badge tone="neutral">Low: {summary.low}</Badge>
          </div>
        </div>
      </Card>

      {summary.anomalies.length === 0 ? (
        <Card>
          <EmptyState icon={<Activity className="w-10 h-10" />} title="No anomalies detected" message={`No statistical outliers found for ${metricLabel(metric)} using Z-score (|z|≥3) and IQR fences.`} />
        </Card>
      ) : (
        <Card padded={false}>
          <div className="p-5 pb-0">
            <h3 className="text-sm font-semibold text-primary">Detected anomalies — {metricLabel(metric)}</h3>
            <p className="text-xs text-muted mt-0.5">{summary.anomalies.length} flagged across {records.length.toLocaleString()} records.</p>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead className="border-y border-app">
                <tr className="text-left text-muted">
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Product</th>
                  <th className="py-2.5 px-3 font-medium">Metric</th>
                  <th className="py-2.5 px-3 font-medium text-right">Value</th>
                  <th className="py-2.5 px-3 font-medium text-right">Expected Range</th>
                  <th className="py-2.5 px-3 font-medium text-right">Z-score</th>
                  <th className="py-2.5 px-3 font-medium">Severity</th>
                  <th className="py-2.5 px-3 font-medium">Possible Reason</th>
                </tr>
              </thead>
              <tbody>
                {top.map((a, i) => (
                  <tr key={i} className="border-b border-app last:border-0 hover:bg-subtle">
                    <td className="py-3 px-3 text-secondary whitespace-nowrap">{formatDate(a.date)}</td>
                    <td className="py-3 px-3 font-medium text-primary whitespace-nowrap">{a.product}</td>
                    <td className="py-3 px-3 text-secondary whitespace-nowrap">{metricLabel(a.metric)}</td>
                    <td className="py-3 px-3 text-right tnum text-primary font-semibold whitespace-nowrap">
                      {a.metric === 'revenue' || a.metric === 'orderValue' ? formatCurrency(a.value) : formatNumber(a.value)}
                    </td>
                    <td className="py-3 px-3 text-right tnum text-secondary whitespace-nowrap">
                      {a.metric === 'revenue' || a.metric === 'orderValue'
                        ? `${formatCurrency(a.expectedLower)}–${formatCurrency(a.expectedUpper)}`
                        : `${formatNumber(a.expectedLower)}–${formatNumber(a.expectedUpper)}`}
                    </td>
                    <td className="py-3 px-3 text-right tnum text-secondary">{a.z > 0 ? `+${a.z}` : a.z}</td>
                    <td className="py-3 px-3"><Badge tone={SEV_TONE[a.severity]}>{a.severity}</Badge></td>
                    <td className="py-3 px-3 text-secondary text-xs">{a.possibleReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-semibold text-primary mb-3">Detection methodology</h3>
        <div className="text-sm text-secondary space-y-3">
          <p>Two complementary, explainable statistical methods are combined. A record is flagged if <strong className="text-primary">either</strong> trips:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-subtle border border-app rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary mb-2">Z-score</h4>
              <p className="font-mono text-xs mb-2">z = (x − μ) / σ</p>
              <p className="text-xs">A value is flagged when |z| ≥ 3 (more than 3 population standard deviations from the mean). Severity: |z| ≥ 4 → High, |z| ≥ 3 → Medium.</p>
            </div>
            <div className="bg-subtle border border-app rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary mb-2">IQR fences</h4>
              <p className="font-mono text-xs mb-2">[Q1 − 1.5·IQR, Q3 + 1.5·IQR]</p>
              <p className="text-xs">Values outside the 1.5×IQR fences are robust outliers (less sensitive to extreme values than z-score). IQR-only hits are Low severity.</p>
            </div>
          </div>
          <p className="text-xs text-muted">μ = mean, σ = population standard deviation, Q1/Q3 = 25th/75th percentile, IQR = Q3 − Q1.</p>
        </div>
      </Card>
    </div>
  );
}
