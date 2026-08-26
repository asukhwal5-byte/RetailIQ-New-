# RetailIQ — Sales, Demand & Inventory Intelligence Platform

**A retail analytics platform that turns raw transaction data into actionable business decisions using transparent statistical methods.**

> *"The goal of analytics is not to have the fanciest model — it is to have the right answer at the right time and to explain it clearly."*

RetailIQ is an end-to-end business intelligence project built as a portfolio piece for data analyst and BI roles. It takes a retail sales dataset and computes — live, in the browser — every KPI, forecast, anomaly flag, inventory metric, and business insight from scratch. No dashboard number is hardcoded. The project also ships with companion Python scripts and a PostgreSQL SQL layer that replicate the same analytics in a traditional data-pipeline context.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Business Problem Being Solved](#business-problem-being-solved)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Dataset Description](#dataset-description)
- [Data Cleaning Methodology](#data-cleaning-methodology)
- [Mathematical / Statistical Methods](#mathematical--statistical-methods)
- [SQL Analysis](#sql-analysis)
- [Forecasting Methodology](#forecasting-methodology)
- [Anomaly Detection Methodology](#anomaly-detection-methodology)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [How to Run the Dashboard](#how-to-run-the-dashboard)
- [How to Run the Python Analysis](#how-to-run-the-python-analysis)
- [How to Run the SQL Analysis](#how-to-run-the-sql-analysis)
- [Example Insights](#example-insights)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Project Demo](#project-demo)
- [Author](#author)

---

## Project Overview

RetailIQ is a production-style business intelligence platform. It opens directly into an executive analytics dashboard with a collapsible sidebar, dark/light theme, and 11 fully functional analytics pages. Every calculation — KPIs, forecasts, anomaly detection, inventory metrics, business insights, scenario simulations — is computed live from the loaded dataset in the browser. There is no backend server to run and no pre-computed data to load.

The project also includes companion Python scripts (using pandas and numpy) and a PostgreSQL SQL schema with 11 business analytics queries, so the same analytical methods are demonstrated across three technology stacks: a web app, Python CLI scripts, and SQL.

---

## Problem Statement

Retailers generate large volumes of transaction data but often lack the tools to convert it into decisions. Key questions go unanswered:

- Which products drive profit vs. which just drive revenue?
- Which items are at risk of stock-out, and when should they be reordered?
- Is demand trending up or down, and what will demand look like next month?
- Are there unusual sales patterns worth investigating — data-entry errors, promotional spikes, or supply disruptions?
- What happens to profit if I change pricing or offer a discount?

RetailIQ answers these questions using transparent, explainable mathematics — not black-box models. Every result can be traced back to a formula that a business stakeholder can understand.

---

## Business Problem Being Solved

A retail manager has a spreadsheet of sales transactions and needs to make decisions about pricing, inventory, and growth. Without analytics tooling, they face:

1. **Data overload** — hundreds or thousands of rows with no summary view
2. **No forecasting** — ordering inventory based on gut feel rather than demand trends
3. **Reactive stock management** — discovering stock-outs after they happen
4. **Margin blindness** — celebrating high-revenue products that actually contribute little profit
5. **No anomaly awareness** — missing data-entry errors or unusual events hidden in the data

RetailIQ addresses each of these by providing an interactive dashboard that computes the relevant metrics on demand, flags risks proactively, and translates the numbers into plain-English recommendations with supporting evidence.

---

## Key Features

| Page | What It Does |
|---|---|
| **Dashboard** | 6 executive KPIs (revenue, profit, margin, orders, units, avg order value) with period-over-period percent change; revenue, profit, and margin trend charts |
| **Sales Analytics** | Revenue, profit, orders, and growth charts with 6 live filters (date range, category, product, region, customer segment, customer) |
| **Product Performance** | Sortable product table with automatic classification badges (best seller, high margin, low margin, slow mover) |
| **Inventory Intelligence** | Days of cover, reorder points, stock-out/overstock risk flags, and a priority reorder list |
| **Demand Forecast** | Holt's linear exponential smoothing forecast with 95% confidence interval and trend direction |
| **Customer Analytics** | Top customers by revenue/profit, customer segment mix, and regional contribution breakdown |
| **Anomaly Detection** | Z-score + IQR outlier detection across 5 metrics (quantity, revenue, selling price, order value, daily units) with severity grading |
| **Business Insights** | Decision Center with 7 auto-generated, evidence-based insights; What-If Scenario Simulator for pricing/volume/cost decisions with break-even analysis |
| **Data Upload** | CSV upload with validation, cleaning, duplicate detection, and a data-quality summary report |
| **Reports** | Consolidated printable report across all analytics with text export |
| **Settings** | Theme toggle (dark/light), data source info, project about |

---

## Screenshots

> Add screenshots to a `docs/` folder in your repository and update the paths below before publishing.

| Page | Screenshot |
|---|---|
| Dashboard | `![Dashboard](docs/screenshots/dashboard.png)` |
| Sales Analytics | `![Sales Analytics](docs/screenshots/sales-analytics.png)` |
| Product Performance | `![Products](docs/screenshots/products.png)` |
| Inventory | `![Inventory](docs/screenshots/inventory.png)` |
| Demand Forecast | `![Forecast](docs/screenshots/forecast.png)` |
| Customer Analytics | `![Customers](docs/screenshots/customers.png)` |
| Anomaly Detection | `![Anomalies](docs/screenshots/anomalies.png)` |
| Business Insights | `![Insights](docs/screenshots/insights.png)` |
| Data Upload | `![Upload](docs/screenshots/upload.png)` |
| Reports | `![Reports](docs/screenshots/reports.png)` |
| Dark Mode | `![Dark Mode](docs/screenshots/dark-mode.png)` |

See [docs/screenshots.md](docs/screenshots.md) for a recommended screenshot capture guide.

---

## Technology Stack

| Purpose | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS (custom theme, dark/light mode) |
| Charts | Recharts |
| CSV parsing | PapaParse |
| Icons | Lucide React |
| Python analysis | pandas, numpy, matplotlib |
| Database schema | PostgreSQL |

---

## Dataset Description

The built-in sample dataset is a **synthetic but realistic** retail sales dataset containing **1,000+ transaction records** spanning approximately 18 months (July 2023 – December 2024).

| Column | Type | Description |
|---|---|---|
| Date | Date | Transaction date (YYYY-MM-DD) |
| Product | String | Product name (15 products across 5 categories) |
| Category | String | Electronics, Furniture, Apparel, Home & Kitchen, Sports |
| Quantity | Integer | Units sold per transaction |
| SellingPrice | Float | Selling price per unit (₹) |
| CostPrice | Float | Cost price per unit (₹) |
| Region | String | North, South, East, West, Central |
| Customer | String | Customer name (20 customers) |

**Dataset design choices:**

- Demand follows per-product **seasonality** (e.g., Electronics peaks in festival months) and a gentle **upward trend** across the 18 months
- Approximately **2% of transactions are injected anomalies** (unusually large orders or price deviations) so the anomaly detection has real signal to find
- Profit margins vary by category and product, so margin analysis surfaces meaningful differences
- The dataset is generated programmatically by `data/generate_sample_data.js` and can be regenerated or replaced with real data via the Upload page

---

## Data Cleaning Methodology

Before any analysis runs, the dataset passes through a validation and cleaning pipeline. The same logic is implemented in both the web app (`src/data/csvParser.ts`) and the Python script (`python/data_cleaning.py`).

1. **Column validation** — Checks that all 8 required columns are present. Common header aliases are accepted (e.g., `qty` → `Quantity`, `unit_price` → `SellingPrice`, `client` → `Customer`).

2. **Missing value detection** — Flags any row where a required field is empty. Each missing value is recorded with the row number and field name.

3. **Duplicate detection** — Builds a full-row signature (date + product + category + quantity + price + cost + region + customer) and deduplicates. Duplicate rows are flagged and excluded.

4. **Numeric validation** — Rejects rows where Quantity, SellingPrice, or CostPrice are non-numeric or negative.

5. **Date validation** — Rejects rows with unparseable date strings.

6. **Quality summary** — Reports total rows, valid rows, invalid rows, duplicate count, and missing value count so the user understands data quality at a glance.

7. **Clean load** — Valid rows replace the active dataset and every analytics page recalculates automatically.

---

## Mathematical / Statistical Methods

Every method used in this project is a standard technique from introductory statistics and operations research. No machine learning libraries are used — each formula is implemented from scratch so the methodology is fully transparent and auditable.

| Method | Formula | Where Used |
|---|---|---|
| Arithmetic mean | x̄ = (Σxᵢ) / n | KPIs, aggregations, forecast residuals |
| Median | Middle value of sorted series | Robust center reference |
| Sample variance | s² = Σ(xᵢ − x̄)² / (n − 1) | Forecast RMSE, anomaly detection |
| Population std dev | σ = √(Σ(xᵢ − μ)² / n) | Z-score calculation (population σ so outliers don't inflate it) |
| Percent change | ((curr − prev) / prev) × 100 | KPI deltas, month-over-month growth |
| Profit margin | (profit / revenue) × 100 | Dashboard, products, categories, customers |
| Moving average | MAₖ = (xₜ + xₜ₋₁ + ... + xₜ₋ₖ₊₁) / k | Trend smoothing |
| Exponential smoothing (Holt's linear) | See [Forecasting Methodology](#forecasting-methodology) | Demand forecasting |
| Z-score | z = (x − μ) / σ | Anomaly detection |
| IQR fences | [Q1 − 1.5×IQR, Q3 + 1.5×IQR] | Anomaly detection |
| Pearson correlation | r = Σ(xᵢ−x̄)(yᵢ−ȳ) / √(Σ(xᵢ−x̄)² × Σ(yᵢ−ȳ)²) | Relationship analysis |
| Break-even point (units) | BE = FixedCost / (Price − VariableCost) | What-If Scenario Simulator |

See [docs/methodology.md](docs/methodology.md) for detailed explanations and worked examples.

---

## SQL Analysis

The project includes a PostgreSQL schema and a set of business analytics queries that replicate the dashboard's calculations in SQL.

**Schema (`sql/schema.sql`):**

Four tables with primary keys, foreign keys, indexes, and generated columns:

- `products` — product catalog with category
- `customers` — customer master with segment and region
- `sales` — transaction事实表 with computed `revenue` and `profit` generated columns
- `inventory` — current stock, lead time, and safety stock per product

**Business Queries (`sql/business_queries.sql`):**

11 commented queries covering the full analytics spectrum:

| # | Query | Method |
|---|---|---|
| 1 | Total revenue, profit, margin, AOV | Aggregate SUM + arithmetic |
| 2 | Monthly sales trend | GROUP BY month, margin per month |
| 3 | Month-over-month growth | LAG() window function |
| 4 | Top 10 products by revenue | JOIN + GROUP BY + ORDER BY |
| 5 | Category performance | GROUP BY category |
| 6 | Regional performance | JOIN customers, GROUP BY region |
| 7 | Low-margin products | CTE with portfolio average + HAVING filter |
| 8 | Inventory stock cover & reorder point | CTE with avg daily sales + CASE for status |
| 9 | Top customers | JOIN customers, GROUP BY customer |
| 10 | Customer segment performance | GROUP BY segment |
| 11 | Anomaly detection (IQR method) | PERCENTILE_CONT + fence calculation |

---

## Forecasting Methodology

**Method:** Holt's Linear Exponential Smoothing (level + trend)

This is a time-series forecasting method that extends simple exponential smoothing by tracking both the current **level** of the series and its **trend** (slope). It is appropriate for data that shows a trend but does not explicitly model seasonality.

**Update equations:**

```
Level:    Lₜ = α · xₜ + (1 − α) · (Lₜ₋₁ + Tₜ₋₁)
Trend:    Tₜ = β · (Lₜ − Lₜ₋₁) + (1 − β) · Tₜ₋₁
Forecast: Fₜ₊ₕ = Lₜ + h · Tₜ
```

**Parameters:**

- α = 0.5 (level smoothing factor — how much weight to give the latest observation)
- β = 0.2 (trend smoothing factor — how much weight to give the latest trend change)

**Confidence interval:**

A 95% confidence band is computed as: forecast ± 1.96 × RMSE

Where RMSE (root mean square error) is calculated from in-sample residuals — the difference between each actual value and the smoothed value at that point:

```
RMSE = √( Σ(actualᵢ − smoothedᵢ)² / n )
```

**Trend direction** is classified by comparing the forecast slope to the initial series value:
- Upward: slope > 2% of the first period's value
- Downward: slope < −2% of the first period's value
- Stable: otherwise

**What this method does NOT do:**

- It does not model **seasonality** (periodic patterns like holiday spikes). This limitation is stated transparently in the forecast page UI.
- It is not a machine learning model. There is no training loop, no gradient descent, and no learned parameters beyond the two fixed smoothing constants.
- It does not produce probabilistic forecasts — the confidence interval is a symmetric band based on residual standard error, not a full predictive distribution.

See [docs/methodology.md](docs/methodology.md#4-demand-forecasting) for a worked example.

---

## Anomaly Detection Methodology

Two complementary statistical methods are combined. A record is flagged as an anomaly if **either** method trips. This catches both extreme deviations (z-score) and robust outliers that may not be extreme in absolute terms but are unusual relative to the data distribution (IQR).

### Method 1: Z-Score

```
z = (x − μ) / σ
```

Where μ is the population mean and σ is the population standard deviation (using population σ rather than sample s so that the outliers themselves do not inflate the standard deviation and hide themselves).

A record is flagged when |z| ≥ 3.

### Method 2: IQR Fences

```
IQR = Q3 − Q1
Lower fence = Q1 − 1.5 × IQR
Upper fence = Q3 + 1.5 × IQR
```

A record is flagged when its value falls outside the fences. This method is robust to extreme values because quartiles are resistant to outliers.

### Severity Grading

The stricter of the two methods wins:

| Severity | Condition |
|---|---|
| High | \|z\| ≥ 4 |
| Medium | \|z\| ≥ 3 |
| Low | IQR-only (z < 3 but outside fences) |

### Metrics Screened

The user can choose which metric to screen:

| Metric | Description |
|---|---|
| Quantity sold | Units per transaction |
| Transaction revenue | Revenue per transaction |
| Selling price | Price per unit |
| Order value | Total order value |
| Daily units sold | Aggregate units per day across all products |

Each flagged anomaly includes a **possible reason** guess (e.g., "Promotional event, seasonal spike, or bulk corporate order" for a high daily-units anomaly) to help the user interpret the finding.

See [docs/methodology.md](docs/methodology.md#5-anomaly-detection) for details.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                    │
│                                                       │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────┐  │
│  │  CSV Upload  │──▶│  Data Layer  │──▶│ Analytics │  │
│  │  (PapaParse) │   │ (DataContext)│   │  Engine   │  │
│  └─────────────┘   └──────┬───────┘   └─────┬─────┘  │
│                           │                  │        │
│                    ┌──────┴───────┐   ┌──────┴─────┐  │
│                    │  Sample Data │   │  11 Pages  │  │
│                    │  Generator   │   │ (Recharts) │  │
│                    └──────────────┘   └────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Analytics Engine (src/analytics/)               │ │
│  │  ├── stats.ts       (mean, σ, z-score, IQR, ...) │ │
│  │  ├── aggregations.ts (KPIs, monthly series)      │ │
│  │  ├── products.ts    (product table + badges)     │ │
│  │  ├── inventory.ts   (days of cover, reorder)     │ │
│  │  ├── forecasting.ts (Holt's exponential smooth)  │ │
│  │  ├── anomalies.ts   (z-score + IQR detection)    │ │
│  │  └── insights.ts    (Decision Center + What-If)  │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────┐     ┌──────────────────┐
│  Python Scripts  │     │   PostgreSQL     │
│  (pandas/numpy)  │     │   (SQL layer)    │
│                  │     │                  │
│  Same analytics  │     │  Same analytics  │
│  in CLI pipeline │     │  in SQL queries  │
└─────────────────┘     └──────────────────┘
```

**Key architectural decisions:**

- **Client-side only:** The web app runs entirely in the browser. No server, no API calls, no database connection required. This makes it instantly deployable as a static site.
- **Pure-function analytics:** Every statistical function is a pure function that takes data in and returns results out. No shared mutable state, no side effects — the analytics engine is testable and predictable.
- **Three-stack demonstration:** The same analytical methods (cleaning, KPIs, forecasting, anomaly detection, inventory) are implemented in TypeScript, Python, and SQL so a reviewer can compare implementations across paradigms.

See [docs/architecture.md](docs/architecture.md) for the full system breakdown.

---

## Installation

### Prerequisites

- **Node.js** 18 or higher (for the web dashboard)
- **Python** 3.8 or higher (for the Python analysis scripts, optional)
- **PostgreSQL** 12 or higher (for the SQL analysis, optional)

### Clone and Install

```bash
git clone https://github.com/YOUR-USERNAME/RetailIQ.git
cd RetailIQ

# Install web app dependencies
npm install
```

### Install Python Dependencies (Optional)

```bash
pip install -r requirements.txt
```

---

## How to Run the Dashboard

```bash
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173`).

The app loads with the sample dataset ready — start exploring the Dashboard immediately. Use the sidebar to navigate between the 11 analytics pages.

### Using the Dashboard

1. **Dashboard** — Start here for the executive summary: 6 KPIs with period-over-period change, plus revenue/profit/margin trend charts.
2. **Sales Analytics** — Use the filter bar at the top to narrow by date range, category, product, region, or customer segment. All charts update instantly.
3. **Product Performance** — Click any column header to sort. Badges classify each product automatically (best seller, high margin, low margin, slow mover).
4. **Inventory Intelligence** — Check the priority reorder list at the top for items at risk of stock-out.
5. **Demand Forecast** — Select a product and forecast period (3/6/12 months). The chart shows historical actuals and the forecast with a 95% confidence band.
6. **Business Insights** — Read the Decision Center for auto-generated, evidence-based recommendations. Use the What-If Simulator to model pricing changes.
7. **Data Upload** — Upload your own CSV file. The app validates, cleans, and loads it, refreshing every page automatically.
8. **Reports** — View a consolidated report and use the export button to download it as a text file.
9. **Settings** — Toggle dark/light theme using the button at the bottom of the sidebar.

### Building for Production

```bash
npm run build
```

This produces an optimized static build in the `dist/` folder that can be hosted on any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

---

## How to Run the Python Analysis

The Python scripts accept a CSV file path as input and output results to the console (and matplotlib charts where applicable).

```bash
# 1. Clean the dataset (validates, removes duplicates, reports quality)
python python/data_cleaning.py data/sample_retail_data.csv

# 2. Sales analysis (KPIs, monthly trends, category/region breakdowns)
python python/sales_analysis.py data/cleaned_retail_data.csv

# 3. Inventory analysis (days of cover, reorder points, risk flags)
python python/inventory_analysis.py data/cleaned_retail_data.csv

# 4. Anomaly detection (z-score + IQR on a chosen metric)
python python/anomaly_detection.py data/cleaned_retail_data.csv --metric daily_units

# 5. Demand forecasting (Holt's exponential smoothing)
python python/demand_forecasting.py data/cleaned_retail_data.csv --product "Wireless Mouse" --periods 6
```

Each script is standalone — it reads the CSV, computes results, and prints a formatted report. The forecasting script also generates a matplotlib chart saved as a PNG.

---

## How to Run the SQL Analysis

```bash
# 1. Create the schema (tables, indexes, generated columns)
psql -d your_database -f sql/schema.sql

# 2. Load the sample data (or your own data)
#    Import the CSV into the sales table using \copy or your preferred method

# 3. Run the business analytics queries
psql -d your_database -f sql/business_queries.sql
```

Each of the 11 queries in `sql/business_queries.sql` is independently runnable and includes comments explaining what it computes and the method used.

---

## Example Insights

The Decision Center on the Business Insights page automatically generates insights like these from the loaded data. Below are examples from the sample dataset:

**1. Profit concentration risk**
> Wireless Mouse generates 28.3% of total profit while representing only 15.1% of units sold.
> *Why it matters:* Heavy dependence on one product means a supply disruption or price cut could materially hurt profitability.
> *Action:* Diversify the profitable product mix — promote the next tier of high-margin products and negotiate backup supply.

**2. High volume, thin margin**
> Apparel has strong sales volume (3,200 units) but a profit margin of 12.4%, which is 8.7 points below the portfolio average.
> *Why it matters:* Revenue looks healthy but contribution to profit is disproportionately small.
> *Action:* Review supplier costs and pricing; consider selective price increases or phase out the lowest-margin SKUs.

**3. Stock-out risk**
> Bluetooth Headphones has ~6 days of inventory left at the current average daily sales rate of 4.2 units/day.
> *Why it matters:* Continued demand will exhaust stock before a typical replenishment cycle completes.
> *Action:* Place a reorder immediately — priority level CRITICAL.

**4. What-If Scenario**
> If we increase the price of Wireless Mouse from ₹1,200 to ₹1,350 (+12.5%) and assume a 10% volume drop:
> Revenue changes from ₹144,000 to ₹146,250. Profit increases from ₹36,000 to ₹40,250. Break-even drops from 120 to 107 units.

---

## Limitations

This project is a portfolio demonstration, not a production system. The following limitations are stated transparently:

1. **Forecasting does not model seasonality.** Holt's linear method captures level and trend but not periodic seasonal patterns. The forecast page states this limitation explicitly in the UI. A real production system would use Holt-Winters (triple exponential smoothing) or SARIMA.

2. **Inventory stock levels are simulated constants.** The current stock figures are generated from the product's average sales volume, not read from a live inventory database. The reorder-point and days-of-cover calculations are correct — they just use simulated starting stock.

3. **The app runs entirely client-side.** Data is not persisted across sessions. Refreshing the page reloads the sample dataset. Uploaded data lives only for the current session.

4. **The sample dataset is synthetic.** While it includes realistic seasonality, trend, and injected anomalies, it is not real retail data. The data generator (`data/generate_sample_data.js`) is included so the dataset can be regenerated or the parameters adjusted.

5. **No machine learning is used.** All methods are classical statistics implemented from scratch. This is a deliberate design choice for transparency and explainability, not a limitation of the implementation — but it means the project should not be characterized as "AI-powered" or "ML-based."

6. **No authentication or multi-user support.** The dashboard is a single-user, single-session tool.

---

## Future Improvements

1. **Seasonal forecasting** — Add Holt-Winters triple exponential smoothing to capture seasonality, or integrate SARIMA for more robust time-series modeling.
2. **Database persistence** — Connect to a live PostgreSQL database so data persists across sessions and multiple users can share datasets.
3. **PDF report export** — Currently the Reports page supports print-to-PDF via the browser and text export. Adding a library like jsPDF would enable direct PDF download.
4. **User authentication** — Add login and multi-tenant workspaces so different users can manage their own datasets.
5. **Automatic model selection** — Compare multiple forecasting methods (simple exponential smoothing, Holt's, Holt-Winters, moving average) and recommend the best fit based on RMSE.
6. **Real-time data ingestion** — Connect to a live data feed or API so the dashboard updates automatically as new transactions arrive.
7. **Forecast accuracy tracking** — Store past forecasts and compare them to actuals over time to measure and report forecast accuracy (MAPE, tracking signal).

---

## Project Demo

A guided demo script is provided in [docs/demo_script.md](docs/demo_script.md) for recording a 3–5 minute screen walkthrough. The recommended flow:

1. **Open the Dashboard** — Highlight the 6 KPIs and period-over-period change
2. **Go to Sales Analytics** — Apply a category filter and show live chart updates
3. **Product Performance** — Point out the auto-classification badges and sort by margin
4. **Inventory Intelligence** — Show the priority reorder list and risk flags
5. **Demand Forecast** — Run a 6-month forecast for a product, point out the confidence interval and the stated limitation about seasonality
6. **Anomaly Detection** — Switch to "Daily units sold" metric, show the flagged anomalies and severity grading
7. **Business Insights** — Walk through the Decision Center insights, then use the What-If Simulator to model a price change
8. **Data Upload** — Show the CSV upload and data quality summary
9. **Reports** — Show the consolidated report and text export
10. **Close** — Summarize: "Everything you saw was computed live from the data — no hardcoded numbers, no black-box models."

---

## Author

**[Your Name]** — B.Sc. Mathematics, Data Analytics Portfolio Project

As a mathematics student with a strong interest in data analytics, I built this project to bridge statistical theory and real-world business decision-making. Every method in this project — exponential smoothing, Z-score, IQR, break-even analysis, Pearson correlation — is one I studied in my mathematics and statistics courses. Implementing them in code forced me to understand not just the formulas, but when to use each method, what their limitations are, and how to communicate the results to a non-technical decision-maker.

I chose retail because it is a domain everyone understands, but the analytics problems it presents — forecasting, anomaly detection, inventory optimization, profit-margin analysis — are exactly the problems a data analyst solves every day.

- GitHub: [https://github.com/YOUR-USERNAME](https://github.com/YOUR-USERNAME)
- LinkedIn: [https://www.linkedin.com/in/YOUR-PROFILE](https://www.linkedin.com/in/YOUR-PROFILE)
- Email: your.email@example.com

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

*RetailIQ — Turn raw sales data into better business decisions.*