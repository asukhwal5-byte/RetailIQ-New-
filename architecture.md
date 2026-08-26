# RetailIQ — Architecture

## Overview

RetailIQ is a single-page application that runs entirely in the browser. All
analytics — KPIs, aggregation, forecasting, anomaly detection and inventory
intelligence — are computed client-side from an in-memory dataset. No backend
server or database is required to run the live dashboard.

A companion set of Python scripts and SQL files is included to demonstrate the
same analytics performed in a traditional data-analysis workflow.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│                                                              │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │ React UI │──▶│ Analytics    │──▶│ Charts (Recharts)   │  │
│  │ (Pages)  │   │ Engine (TS)  │   │ Tables / KPI Cards  │  │
│  └──────────┘   └──────────────┘   └─────────────────────┘  │
│        │               ▲                                    │
│        ▼               │                                    │
│  ┌──────────┐   ┌──────┴───────┐   ┌─────────────────────┐  │
│  │ CSV      │──▶│ Data Context │──▶│ Sample Data Gen     │  │
│  │ Upload   │   │ (React State)│   │ (1200 records)      │  │
│  │ (Papa)   │   └──────────────┘   └─────────────────────┘  │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Companion Analysis Scripts                      │
│  python/   → pandas + numpy (same calculations, CLI output)  │
│  sql/      → PostgreSQL queries (schema + business queries)  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Layers

| Layer            | Location               | Responsibility                                   |
|------------------|------------------------|--------------------------------------------------|
| UI / Pages       | `src/pages/`           | 11 dashboard pages (dashboard, sales, etc.)      |
| Components       | `src/components/`      | Sidebar, Topbar, KPI cards, filter bar, UI kit   |
| Context          | `src/context/`         | DataProvider (dataset + filters), ThemeProvider  |
| Analytics Engine | `src/analytics/`       | Stats, aggregations, products, inventory,        |
|                  |                        | forecasting, anomalies, insights                 |
| Data Layer       | `src/data/`            | Sample data generator, CSV parser/validator       |
| Utils            | `src/utils/`           | Formatting (currency, percent, dates)            |

## Data Flow

1. On load, `DataProvider` generates ~1200 realistic sample sales records.
2. Records are enriched with derived fields (revenue, cost, profit, margin).
3. Filters (date range, category, product, region, segment) narrow the scope.
4. Each page runs analytics functions via `useMemo` on the filtered set.
5. CSV upload replaces the in-memory dataset after validation/cleaning.

## Technology Stack

| Purpose              | Technology                  |
|----------------------|-----------------------------|
| Framework            | React 18 + TypeScript       |
| Build tool           | Vite                        |
| Styling              | Tailwind CSS                |
| Charts               | Recharts                    |
| CSV parsing          | PapaParse                   |
| Icons                | Lucide React                |
| Python analysis      | pandas, numpy               |
| SQL                  | PostgreSQL                  |

## Companion Scripts

The `python/` and `sql/` folders replicate the browser analytics in a
traditional data pipeline. They are self-contained and can be run independently
of the web application.
