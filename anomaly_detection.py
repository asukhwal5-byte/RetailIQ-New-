"""
anomaly_detection.py — RetailIQ Anomaly Detection
===================================================
Detects statistical outliers in sales data using two explainable methods:

1. Z-score:   z = (x - mean) / sigma   →  flag |z| >= 3
2. IQR fences: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]  →  flag values outside

A record is reported if EITHER method trips. Severity:
  |z| >= 4  → High
  |z| >= 3  → Medium
  IQR-only  → Low

Usage:
    python anomaly_detection.py data/cleaned_retail_data.csv [--metric daily_units]
"""

import sys
import pandas as pd
import numpy as np


def z_score(values: pd.Series) -> pd.Series:
    """Population z-score: (x - mean) / population_std."""
    mu = values.mean()
    sigma = values.std(ddof=0)  # population std (ddof=0)
    if sigma == 0:
        return pd.Series([0] * len(values), index=values.index)
    return (values - mu) / sigma


def iqr_bounds(values: pd.Series) -> tuple:
    """Return (lower, upper) fences: Q1 - 1.5*IQR, Q3 + 1.5*IQR."""
    q1 = values.quantile(0.25)
    q3 = values.quantile(0.75)
    iqr = q3 - q1
    return q1 - 1.5 * iqr, q3 + 1.5 * iqr


def severity(z: float) -> str:
    az = abs(z)
    if az >= 4:
        return "High"
    elif az >= 3:
        return "Medium"
    return "Low"


def detect(df: pd.DataFrame, metric: str = "daily_units") -> pd.DataFrame:
    """Detect anomalies for the given metric."""
    if metric == "daily_units":
        series = df.groupby("Date")["Quantity"].sum().reset_index()
        values = series["Quantity"]
        zs = z_score(values)
        lower, upper = iqr_bounds(values)

        flags = (zs.abs() >= 3) | (values < lower) | (values > upper)
        anomalies = series[flags].copy()
        anomalies["ZScore"] = zs[flags].round(2)
        anomalies["ExpectedLower"] = round(max(0, lower), 1)
        anomalies["ExpectedUpper"] = round(upper, 1)
        anomalies["Severity"] = anomalies["ZScore"].apply(severity)
        anomalies = anomalies.rename(columns={"Quantity": "Value", "Date": "Date"})
        return anomalies.sort_values("ZScore", key=abs, ascending=False)

    # Per-record metrics
    metric_map = {
        "quantity": "Quantity",
        "revenue": "Revenue",
        "selling_price": "SellingPrice",
        "order_value": "Revenue",
    }
    col = metric_map.get(metric, metric)
    values = df[col]
    zs = z_score(values)
    lower, upper = iqr_bounds(values)

    flags = (zs.abs() >= 3) | (values < lower) | (values > upper)
    anomalies = df[flags][["Date", "Product", "Category", col]].copy()
    anomalies["ZScore"] = zs[flags].round(2)
    anomalies["ExpectedLower"] = round(max(0, lower), 1)
    anomalies["ExpectedUpper"] = round(upper, 1)
    anomalies["Severity"] = anomalies["ZScore"].apply(severity)
    anomalies = anomalies.rename(columns={col: "Value"})
    return anomalies.sort_values("ZScore", key=abs, ascending=False)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/cleaned_retail_data.csv"
    metric = "daily_units"
    if "--metric" in sys.argv:
        metric = sys.argv[sys.argv.index("--metric") + 1]

    df = pd.read_csv(path, parse_dates=["Date"])

    print("=" * 50)
    print("RetailIQ — Anomaly Detection")
    print(f"Metric: {metric}")
    print("=" * 50)

    anomalies = detect(df, metric)
    if anomalies.empty:
        print("\nNo anomalies detected.")
        return

    print(f"\nTotal anomalies: {len(anomalies)}")
    print(f"  High:   {(anomalies['Severity'] == 'High').sum()}")
    print(f"  Medium: {(anomalies['Severity'] == 'Medium').sum()}")
    print(f"  Low:    {(anomalies['Severity'] == 'Low').sum()}")
    print("\n--- Top Anomalies ---")
    print(anomalies.head(20).to_string(index=False))


if __name__ == "__main__":
    main()
