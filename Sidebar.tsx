import {
  LayoutDashboard, TrendingUp, Package, Boxes, LineChart, Users,
  AlertTriangle, Lightbulb, Upload, FileText, Settings, ChevronLeft, ChevronRight,
  BarChart3, Moon, Sun,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export type PageId =
  | 'dashboard' | 'sales' | 'products' | 'inventory' | 'forecast'
  | 'customers' | 'anomalies' | 'insights' | 'upload' | 'reports' | 'settings';

interface NavItem { id: PageId; label: string; icon: typeof LayoutDashboard; }

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
  { id: 'products', label: 'Product Performance', icon: Package },
  { id: 'inventory', label: 'Inventory Intelligence', icon: Boxes },
  { id: 'forecast', label: 'Demand Forecast', icon: LineChart },
  { id: 'customers', label: 'Customer Analytics', icon: Users },
  { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
  { id: 'insights', label: 'Business Insights', icon: Lightbulb },
  { id: 'upload', label: 'Data Upload', icon: Upload },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface Props {
  current: PageId;
  onNavigate: (p: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ current, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobile} />}

      <aside
        className={`fixed lg:static top-0 left-0 h-full z-50 bg-surface border-r border-app flex flex-col transition-all duration-200
          ${collapsed ? 'lg:w-[68px]' : 'lg:w-[240px]'} w-[240px]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-app shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-semibold text-primary tracking-tight leading-none">RetailIQ</div>
              <div className="text-[10px] text-muted mt-1 leading-none">Sales & Inventory Intelligence</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = current === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => { onNavigate(item.id); onCloseMobile(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring
                      ${active ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' : 'text-secondary hover:bg-subtle hover:text-primary'}`}
                    title={item.label}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: theme + collapse + profile */}
        <div className="border-t border-app p-2 space-y-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:bg-subtle hover:text-primary transition-colors focus-ring"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>}
          </button>

          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">AM</div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-medium text-primary truncate">Analyst</div>
                <div className="text-xs text-muted truncate">Portfolio Demo</div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:bg-subtle hover:text-primary transition-colors focus-ring"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
