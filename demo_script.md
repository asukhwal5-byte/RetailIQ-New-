# RetailIQ — Demo Script (3–5 minute screen recording)

This script guides you through recording a portfolio demonstration video.
Record your screen while following the steps below and narrating the lines.

---

## Before Recording
- Run the app: `npm run dev`
- Open in browser at full width (desktop view)
- Have `data/sample_retail_data.csv` ready for the upload demo
- Close unnecessary browser tabs

---

## Step 1 — Open RetailIQ (0:00)

**Action:** Load the app in the browser. The Dashboard appears.

**Narration:**
> "This is RetailIQ, a sales, demand and inventory intelligence platform I built
> as my flagship portfolio project. It opens directly into an executive
> dashboard — no marketing landing page, just analytics."

---

## Step 2 — Explain the Dashboard (0:20)

**Action:** Point to the six KPI cards, then the charts below.

**Narration:**
> "The dashboard shows six executive KPIs — Total Revenue, Profit, Profit
> Margin, Orders, Units Sold, and Average Order Value — each with a percent
> change compared to the previous period. Every number is calculated live from
> the dataset; nothing is hardcoded. Below are revenue and profit trends, a
> regional pie chart, margin trend and a category breakdown."

---

## Step 3 — Upload Dataset (0:50)

**Action:** Click "Data Upload" in the sidebar. Drag in the sample CSV.

**Narration:**
> "The Data Upload page accepts any CSV with the expected columns. When I drop
> in a file, it validates columns, detects missing values, duplicates, and
> invalid numbers or dates — then shows a full data-quality summary."

---

## Step 4 — Show Data Cleaning (1:15)

**Action:** Point to the quality summary cards and the issues table.

**Narration:**
> "The summary shows total rows, valid rows, invalid rows, duplicates and
> missing values. Each issue is listed with the row number and reason. I can
> then load the cleaned dataset, which refreshes the entire dashboard."

---

## Step 5 — Analyze Sales (1:40)

**Action:** Click "Sales Analytics". Change a filter (e.g., select a category).

**Narration:**
> "Sales Analytics has interactive charts for revenue, profit, orders, monthly
> growth, category and regional performance. Every chart updates dynamically
> when I change the date range, category, product, region or segment filter."

---

## Step 6 — Show Product Performance (2:05)

**Action:** Click "Product Performance". Click a table header to sort.

**Narration:**
> "The Product Performance table shows units, revenue, cost, profit, margin,
> growth and stock status for every product. It automatically classifies
> products as Best Seller, Most Profitable, Low Margin, Slow Moving, High or
> Low Growth — all based on calculated thresholds."

---

## Step 7 — Show Inventory Risk (2:30)

**Action:** Click "Inventory Intelligence".

**Narration:**
> "Inventory Intelligence calculates average daily sales, days of cover, reorder
> points and stock-out risk for each product. The Priority Reorder List ranks
> items by risk — critical items need immediate reordering."

---

## Step 8 — Show Demand Forecast (2:55)

**Action:** Click "Demand Forecast". Change the forecast period.

**Narration:**
> "The Demand Forecast uses Holt's linear exponential smoothing — an
> explainable method that tracks level and trend. It shows the historical-vs-
> forecast chart, a 95% confidence range, trend direction and model accuracy as
> RMSE. The methodology is displayed transparently."

---

## Step 9 — Show Anomaly Detection (3:20)

**Action:** Click "Anomaly Detection". Switch between metrics.

**Narration:**
> "Anomaly Detection combines Z-score and IQR fence methods to flag unusual
> sales quantities, revenue, prices or daily volumes. Each anomaly shows the
> date, value, expected range, severity and a possible reason. The math is
> explained right on the page."

---

## Step 10 — Use What-If Simulator (3:45)

**Action:** Click "Business Insights". Scroll to the Scenario Simulator. Adjust sliders.

**Narration:**
> "The Scenario Simulator lets me change price, cost, volume, discount and
> fixed cost — then computes revenue, profit, margin and break-even for the
> current vs. simulated scenario. If I increase price by 5%, I can see exactly
> how profit changes. It's labeled as a simulation, not a prediction."

---

## Step 11 — Show Decision Center (4:10)

**Action:** Scroll up to the insight cards.

**Narration:**
> "The Decision Center generates actionable insights from the data — profit
> concentration risk, low-margin categories, stock-out alerts, fastest-growing
> regions. Each insight has evidence, why it matters, and a recommended action."

---

## Step 12 — Explain Technology Stack (4:30)

**Narration:**
> "The app is built with React, TypeScript, Vite and Tailwind CSS, with Recharts
> for visualization. The analytics engine is pure TypeScript — no black-box AI.
> The project also includes Python scripts using pandas and numpy, plus a full
> PostgreSQL SQL schema and business query set for the same analysis."

---

## Step 13 — End with GitHub / Portfolio (4:50)

**Action:** Show the browser tab or a slide with your GitHub URL.

**Narration:**
> "The full source code, Python scripts, SQL files, sample dataset and
> documentation are on my GitHub. Thank you for watching."

---

## Tips
- Speak clearly and at a moderate pace.
- Pause briefly when switching pages so the viewer can see transitions.
- Keep the recording under 5 minutes.
- Use 1080p screen resolution for clarity.
