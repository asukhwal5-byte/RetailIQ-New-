import type { ReactNode } from 'react';

export function Card({ children, className = '', padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={`bg-surface border border-app rounded-xl shadow-card ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon, action }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-brand-500">{icon}</div>}
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ChartTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ icon, title, message }: { icon?: ReactNode; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="text-sm text-secondary mt-1 max-w-sm">{message}</p>
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
    info: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
