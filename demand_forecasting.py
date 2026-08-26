"""
demand_forecasting.py — RetailIQ Demand Forecasting
=====================================================
Forecasts future demand using Holt's linear exponential smoothing,
which maintains a level and a trend (slope) term:

  Level:   L_t = alpha * x_t + (1 - alpha) * (L_{t-1} + T_{t-1})
  Trend:   T_t = beta  * (L_t - L_{t-1}) + (1 - beta) * T_{t-1}
  Forecast:F_{t+h} = L_t + h * T_t

A 95% confidence interval is derived from in-sample residuals:
  forecast +/- 1.96 * RMSE(residuals)

Usage:
    python demand_forecasting.py data/cleaned_retail_data.csv [--product "Wireless Mouse"] [--periods 6]
"""

import sys
import pandas as pd
import numpy as np


def holt_linear(series: list, alpha: float = 0.5, beta: float = 0.2) -> tuple:
    """Run Holt's linear smoothing. Returns (smoothed_levels, final_level, final_trend)."""
    if len(series) == 0:
        return [], 0, 0
    level = series[0]
    trend = 0
    smoothed = [level]
    for t in range(1, len(series)):
        prev_level = level
        level = alpha * series[t] + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend
        smoothed.append(level + trend)
    return smoothed, level, trend


def forecast_demand(df: pd.DataFrame, product: str = None,
                    periods: int = 6, alpha: float = 0.5, beta: float = 0.2) -> dict:
    """Forecast demand for a product (or all products) for `periods` months ahead."""
    if product:
        df = df[df["Product"] == product]

    # Aggregate to monthly demand
    monthly = df.groupby("Month")["Quantity"].sum().sort_index()
    series = monthly.values.tolist()

    if len(series) < 3:
        return {"error": "Insufficient data for forecasting (need >= 3 periods)."}

    smoothed, level, trend = holt_linear(series, alpha, beta)

    # Generate forecast
    forecast = [max(0, level + (h + 1) * trend) for h in range(periods)]

    # RMSE of in-sample residuals
    residuals = [series[i] - smoothed[i] for i in range(len(series))]
    rmse = np.sqrt(np.mean([r ** 2 for r in residuals]))
    margin = 1.96 * rmse

    forecast_total = sum(forecast)
    trend_label = "Upward" if trend > series[0] * 0.02 else "Downward" if trend < -series[0] * 0.02 else "Stable"

    # Generate future month labels
    last_month = monthly.index[-1]
    year, month = map(int, last_month.split("-"))
    labels = []
    for _ in range(periods):
        month += 1
        if month > 12:
            month = 1
            year += 1
        labels.append(f"{year}-{month:02d}")

    return {
        "method": "Holt's Linear Exponential Smoothing (level + trend)",
        "alpha": alpha,
        "beta": beta,
        "history_months": len(series),
        "forecast_labels": labels,
        "forecast_values": [round(v, 1) for v in forecast],
        "forecast_total": round(forecast_total, 1),
        "expected_range": (round(max(0, forecast_total - margin), 1), round(forecast_total + margin, 1)),
        "rmse": round(rmse, 1),
        "trend": trend_label,
    }


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/cleaned_retail_data.csv"
    product = None
    periods = 6
    if "--product" in sys.argv:
        product = sys.argv[sys.argv.index("--product") + 1]
    if "--periods" in sys.argv:
        periods = int(sys.argv[sys.argv.index("--periods") + 1])

    df = pd.read_csv(path, parse_dates=["Date"])

    print("=" * 50)
    print("RetailIQ — Demand Forecasting")
    print(f"Product: {product or 'All products'}")
    print(f"Periods: {periods} months")
    print("=" * 50)

    result = forecast_demand(df, product=product, periods=periods)
    if "error" in result:
        print(f"\n{result['error']}")
        return

    print(f"\nMethod: {result['method']}")
    print(f"Alpha (level): {result['alpha']} | Beta (trend): {result['beta']}")
    print(f"RMSE: {result['rmse']} units")
    print(f"Trend: {result['trend']}")
    print(f"\nForecast total ({periods} months): {result['forecast_total']} units")
    print(f"Expected range (95% CI): {result['expected_range'][0]} - {result['expected_range'][1]} units")
    print(f"\n--- Monthly Forecast ---")
    for label, value in zip(result["forecast_labels"], result["forecast_values"]):
        print(f"  {label}: {value} units")


if __name__ == "__main__":
    main()
