"""
inventory_analysis.py — RetailIQ Inventory Intelligence
========================================================
Computes current stock cover, average daily sales, reorder points and
stock-out / overstock risk from sales data.

Definitions:
  - Avg daily sales = total units sold / date span (days)
  - Days remaining  = current stock / avg daily sales
  - Reorder point   = avg daily sales * (lead_time + safety_stock)
    where lead_time = 7 days, safety_stock = 7 days of demand

Usage:
    python inventory_analysis.py data/cleaned_retail_data.csv
"""

import sys
import pandas as pd

# Simulated current stock levels per product (units on hand).
STOCK_LEVELS = {
    "Wireless Mouse": 320, "USB-C Hub": 180, "Bluetooth Speaker": 90,
    "Office Chair": 60, "Standing Desk": 40, "Bookshelf": 75,
    "Cotton T-Shirt": 480, "Denim Jacket": 150, "Running Shoes": 120,
    "Cookware Set": 85, "Air Fryer": 55, "LED Desk Lamp": 260,
    "Water Bottle": 600, "Notebook Set": 720, "Premium Pen": 340,
}

LEAD_TIME_DAYS = 7
SAFETY_STOCK_DAYS = 7


def avg_daily_sales(df: pd.DataFrame) -> pd.Series:
    """Units sold per day per product over the data span."""
    span_days = (df["Date"].max() - df["Date"].min()).days or 1
    units = df.groupby("Product")["Quantity"].sum()
    return units / max(span_days, 1)


def classify_status(days_remaining: float) -> str:
    if days_remaining < 7:
        return "CRITICAL"
    elif days_remaining < 21:
        return "LOW STOCK"
    elif days_remaining > 90:
        return "OVERSTOCKED"
    return "HEALTHY"


def risk_level(days_remaining: float) -> str:
    if days_remaining < 21:
        return "HIGH"
    elif days_remaining < 35:
        return "MEDIUM"
    return "LOW"


def inventory_report(df: pd.DataFrame) -> pd.DataFrame:
    daily = avg_daily_sales(df)
    rows = []
    for product, avg_daily in daily.items():
        stock = STOCK_LEVELS.get(product, 100)
        days_remaining = stock / avg_daily if avg_daily > 0 else float("inf")
        reorder_point = avg_daily * (LEAD_TIME_DAYS + SAFETY_STOCK_DAYS)

        rows.append({
            "Product": product,
            "Current Stock": stock,
            "Avg Daily Sales": round(avg_daily, 1),
            "Days Remaining": round(days_remaining, 1) if days_remaining != float("inf") else 999,
            "Reorder Point": int(reorder_point),
            "Status": classify_status(days_remaining),
            "Risk": risk_level(days_remaining),
        })
    result = pd.DataFrame(rows)
    risk_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    return result.sort_values(by="Risk", key=lambda r: r.map(risk_order))


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/cleaned_retail_data.csv"
    df = pd.read_csv(path, parse_dates=["Date"])

    print("=" * 50)
    print("RetailIQ — Inventory Intelligence")
    print("=" * 50)

    report = inventory_report(df)
    print("\n--- Full Inventory Table ---")
    print(report.to_string(index=False))

    priority = report[report["Risk"].isin(["HIGH", "MEDIUM"])]
    print(f"\n--- Priority Reorder List ({len(priority)} items) ---")
    print(priority.to_string(index=False))


if __name__ == "__main__":
    main()
