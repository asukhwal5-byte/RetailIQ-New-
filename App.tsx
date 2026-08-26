import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { DashboardPage } from '@/pages/DashboardPage';
import { SalesAnalyticsPage } from '@/pages/SalesAnalyticsPage';
import { ProductPerformancePage } from '@/pages/ProductPerformancePage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ForecastPage } from '@/pages/ForecastPage';
import { CustomerAnalyticsPage } from '@/pages/CustomerAnalyticsPage';
import { AnomalyDetectionPage } from '@/pages/AnomalyDetectionPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { UploadPage } from '@/pages/UploadPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const TITLES: Record<PageId, string> = {
  dashboard: 'Dashboard',
  sales: 'Sales Analytics',
  products: 'Product Performance',
  inventory: 'Inventory Intelligence',
  forecast: 'Demand Forecast',
  customers: 'Customer Analytics',
  anomalies: 'Anomaly Detection',
  insights: 'Business Insights',
  upload: 'Data Upload',
  reports: 'Reports',
  settings: 'Settings',
};

function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ThemeProvider>
      <DataProvider>
        <div className="flex h-screen bg-app overflow-hidden">
          <Sidebar
            current={page}
            onNavigate={setPage}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar title={TITLES[page]} onOpenMobile={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="max-w-[1400px] mx-auto animate-fade-in">
                {page === 'dashboard' && <DashboardPage />}
                {page === 'sales' && <SalesAnalyticsPage />}
                {page === 'products' && <ProductPerformancePage />}
                {page === 'inventory' && <InventoryPage />}
                {page === 'forecast' && <ForecastPage />}
                {page === 'customers' && <CustomerAnalyticsPage />}
                {page === 'anomalies' && <AnomalyDetectionPage />}
                {page === 'insights' && <InsightsPage />}
                {page === 'upload' && <UploadPage />}
                {page === 'reports' && <ReportsPage />}
                {page === 'settings' && <SettingsPage />}
              </div>
            </main>
          </div>
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
