"""
sales_analysis.py — RetailIQ Sales Analytics
==============================================
Computes KPIs, monthly trends, category/region performance and growth rates
from cleaned retail data.

Usage:
    python sales_analysis.py data/cleaned_retail_data.csv
"""

import sys
import pandas as pd
import numpy as np


def load(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["Date"])
    return df


def kpis(df: pd.DataFrame) -> dict:
    """Compute executive KPIs from the dataset."""
    total_revenue = df["Revenue"].sum()
    total_profit = df["Profit"].sum()
    profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
    total_orders = len(df)
    units_sold = df["Quantity"].sum()
    aov = total_revenue / total_orders if total_orders > 0 else 0

    return {
        "Total Revenue": total_revenue,
        "Total Profit": total_profit,
        "Profit Margin (%)": round(profit_margin, 2),
        "Total Orders": total_orders,
        "Units Sold": units_sold,
        "Avg Order Value": round(aov, 2),
    }


def monthly_trend(df: pd.DataFrame) -> pd.DataFrame:
    """Monthly revenue, profit, orders and MoM growth."""
    monthly = df.groupby("Month").agg(
        Revenue=("Revenue", "sum"),
        Profit=("Profit", "sum"),
        Orders=("Quantity", "count"),
        Units=("Quantity", "sum"),
    ).reset_index()

    # Month-over-month revenue growth: (curr - prev) / prev * 100
    monthly["Growth (%)"] = monthly["Revenue"].pct_change() * 100
    monthly["Margin (%)"] = (monthly["Profit"] / monthly["Revenue"] * 100).round(2)
    return monthly


def category_performance(df: pd.DataFrame) -> pd.DataFrame:
    cats = df.groupby("Category").agg(
        Revenue=("Revenue", "sum"),
        Profit=("Profit", "sum"),
        Units=("Quantity", "sum"),
        Orders=("Quantity", "count"),
    ).reset_index()
    cats["Margin (%)"] = (cats["Profit"] / cats["Revenue"] * 100).round(2)
    return cats.sort_values("Revenue", ascending=False)


def region_performance(df: pd.DataFrame) -> pd.DataFrame:
    regs = df.groupby("Region").agg(
        Revenue=("Revenue", "sum"),
        Profit=("Profit", "sum"),
        Units=("Quantity", "sum"),
    ).reset_index()
    regs["Margin (%)"] = (regs["Profit"] / regs["Revenue"] * 100).round(2)
    return regs.sort_values("Revenue", ascending=False)


def top_products(df: pd.DataFrame, n: int = 10) -> pd.DataFrame:
    prods = df.groupby("Product").agg(
        Revenue=("Revenue", "sum"),
        Profit=("Profit", "sum"),
        Units=("Quantity", "sum"),
    ).reset_index()
    prods["Margin (%)"] = (prods["Profit"] / prods["Revenue"] * 100).round(2)
    return prods.sort_values("Revenue", ascending=False).head(n)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/cleaned_retail_data.csv"
    df = load(path)

    print("=" * 50)
    print("RetailIQ — Sales Analytics")
    print("=" * 50)

    print("\n--- Executive KPIs ---")
    for k, v in kpis(df).items():
        print(f"  {k:20s}: {v:>15,.2f}")

    print("\n--- Monthly Trend ---")
    print(monthly_trend(df).to_string(index=False))

    print("\n--- Category Performance ---")
    print(category_performance(df).to_string(index=False))

    print("\n--- Region Performance ---")
    print(region_performance(df).to_string(index=False))

    print("\n--- Top 10 Products ---")
    print(top_products(df).to_string(index=False))


if __name__ == "__main__":
    main()
