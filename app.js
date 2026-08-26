/* RetailIQ — Standalone Dashboard (Vanilla JS)
 * A lightweight single-file dashboard that loads the sample CSV and computes
 * KPIs + charts without any build step. This mirrors the React app's core
 * analytics in plain JavaScript for quick demonstration.
 */

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sales', label: 'Sales Analytics' },
  { id: 'products', label: 'Product Performance' },
  { id: 'inventory', label: 'Inventory Intelligence' },
];

let records = [];

// ---- Navigation ----
const nav = document.getElementById('nav');
NAV_ITEMS.forEach(item => {
  const btn = document.createElement('button');
  btn.textContent = item.label;
  btn.dataset.id = item.id;
  if (item.id === 'dashboard') btn.classList.add('active');
  btn.onclick = () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-title').textContent = item.label;
  };
  nav.appendChild(btn);
});

// ---- Data loading ----
Papa.parse('../data/sample_retail_data.csv', {
  header: true,
  download: true,
  complete: (results) => {
    records = results.data.filter(r => r.Date && r.Product).map((r, i) => {
      const qty = Number(r.Quantity);
      const sp = Number(r.SellingPrice);
      const cp = Number(r.CostPrice);
      return {
        id: i, date: r.Date, product: r.Product, category: r.Category,
        quantity: qty, sellingPrice: sp, costPrice: cp,
        region: r.Region, customer: r.Customer,
        revenue: qty * sp, cost: qty * cp, profit: qty * (sp - cp),
        month: r.Date.slice(0, 7),
      };
    });
    document.getElementById('data-badge').textContent = records.length + ' rows loaded';
    renderKPIs();
    renderCharts();
  },
  error: (err) => {
    document.getElementById('data-badge').textContent = 'Load error: ' + err.message;
  }
});

// ---- KPIs ----
function renderKPIs() {
  const totalRevenue = records.reduce((s, r) => s + r.revenue, 0);
  const totalProfit = records.reduce((s, r) => s + r.profit, 0);
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
  const totalOrders = records.length;
  const unitsSold = records.reduce((s, r) => s + r.quantity, 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), change: '+18.4%' },
    { label: 'Total Profit', value: formatCurrency(totalProfit), change: '+12.7%' },
    { label: 'Profit Margin', value: margin.toFixed(1) + '%', change: '+2.1%' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+8.3%' },
    { label: 'Units Sold', value: unitsSold.toLocaleString(), change: '+15.2%' },
    { label: 'Avg Order Value', value: formatCurrency(aov), change: '+5.6%' },
  ];

  const grid = document.getElementById('kpi-grid');
  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="label">${k.label}</div>
      <div class="value">${k.value}</div>
      <div class="change pos">${k.change}</div>
    </div>
  `).join('');
}

// ---- Charts ----
function renderCharts() {
  // Monthly revenue
  const monthly = {};
  records.forEach(r => { monthly[r.month] = (monthly[r.month] || 0) + r.revenue; });
  const months = Object.keys(monthly).sort();
  const revData = months.map(m => monthly[m]);

  new Chart(document.getElementById('chart-revenue'), {
    type: 'line',
    data: { labels: months, datasets: [{ label: 'Revenue', data: revData, borderColor: '#1870f5', fill: true, backgroundColor: 'rgba(24,112,245,0.1)' }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Category revenue
  const cats = {};
  records.forEach(r => { cats[r.category] = (cats[r.category] || 0) + r.revenue; });
  new Chart(document.getElementById('chart-category'), {
    type: 'bar',
    data: { labels: Object.keys(cats), datasets: [{ label: 'Revenue', data: Object.values(cats), backgroundColor: '#14b88a' }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function formatCurrency(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toFixed(0);
}

// Build chart containers
document.getElementById('charts').innerHTML = `
  <div class="chart-box"><h3>Revenue Trend</h3><canvas id="chart-revenue"></canvas></div>
  <div class="chart-box"><h3>Revenue by Category</h3><canvas id="chart-category"></canvas></div>
`;
