# RetailIQ — Methodology

This document explains every mathematical method used in RetailIQ. All
calculations are implemented in `src/analytics/` (TypeScript) and mirrored in
`python/` (Python).

---

## 1. Descriptive Statistics

| Metric          | Formula                                              |
|-----------------|------------------------------------------------------|
| Mean            | μ = Σxᵢ / n                                         |
| Median          | Middle value of sorted data (or average of two mid)  |
| Variance        | s² = Σ(xᵢ − μ)² / (n − 1)   [sample variance]       |
| Std Deviation   | σ = √variance                                        |
| Percent change  | ((curr − prev) / prev) × 100                         |

Used in: KPI cards, monthly growth, product growth rates.

---

## 2. Profit Margin

```
margin = profit / revenue × 100
profit = revenue − cost = (quantity × sellingPrice) − (quantity × costPrice)
```

Used in: Dashboard, Product Performance, Category/Region analysis.

---

## 3. Moving Average

```
MA_k = (x_t + x_{t-1} + ... + x_{t-k+1}) / k
```

A simple rolling mean over a window of k periods. Used to smooth noisy
time series before visualization.

---

## 4. Demand Forecasting — Holt's Linear Exponential Smoothing

Holt's method extends simple exponential smoothing by tracking both a
**level** and a **trend** (slope) term:

```
Level:   L_t = α · x_t + (1 − α) · (L_{t-1} + T_{t-1})
Trend:   T_t = β · (L_t − L_{t-1}) + (1 − β) · T_{t-1}
Forecast: F_{t+h} = L_t + h · T_t
```

**Parameters:** α = 0.5 (level smoothing), β = 0.2 (trend smoothing).

**Confidence interval (95%):**
```
range = forecast ± 1.96 × RMSE
RMSE = √( Σ(actualᵢ − smoothedᵢ)² / n )
```

**Why this method?** It is transparent, requires no training step, captures
trend, and runs reliably in-browser. It does NOT model seasonality — this
limitation is stated in the UI.

---

## 5. Anomaly Detection — Z-score + IQR

Two complementary methods are combined. A record is flagged if **either** trips.

### Z-score
```
z = (x − μ) / σ        (population std, ddof=0)
```
Flag when |z| ≥ 3. Severity: |z| ≥ 4 → High, |z| ≥ 3 → Medium.

### IQR Fences
```
IQR = Q3 − Q1
Lower fence = Q1 − 1.5 × IQR
Upper fence = Q3 + 1.5 × IQR
```
Flag any value outside the fences. IQR-only hits → Low severity.

### Why both?
Z-score is sensitive to the mean and flags extreme deviations. IQR is robust
to outliers and catches values that are unusual but not extreme. Combining
them reduces false negatives.

---

## 6. Inventory Intelligence

```
Avg daily sales   = total units sold / date span (days)
Days remaining    = current stock / avg daily sales
Reorder point     = avg daily sales × (lead_time + safety_stock)
                    lead_time = 7 days, safety_stock = 7 days
```

| Status      | Days remaining  | Risk   |
|-------------|-----------------|--------|
| CRITICAL    | < 7             | HIGH   |
| LOW STOCK   | < 21            | HIGH   |
| HEALTHY     | 21 – 90         | LOW    |
| OVERSTOCKED | > 90            | MEDIUM |

---

## 7. Break-Even Analysis (What-If Simulator)

```
Break-even units = fixed cost / (effective price − variable cost per unit)
Effective price   = selling price × (1 − discount%)
```

Used in the Scenario Simulator to show how many units must be sold to cover
fixed costs at a given price/cost/discount combination.

---

## 8. Correlation

Pearson correlation coefficient, used where appropriate to check relationships
between metrics (e.g., price vs. quantity):

```
r = Σ(xᵢ − x̄)(yᵢ − ȳ) / √(Σ(xᵢ − x̄)² · Σ(yᵢ − ȳ)²)
```

Range: [−1, 1]. Values near ±1 indicate strong linear relationship.
