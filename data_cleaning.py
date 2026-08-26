"""
data_cleaning.py — RetailIQ Data Cleaning Pipeline
====================================================
Cleans a raw retail sales CSV: validates columns, detects missing/invalid
values, removes duplicates, and outputs a clean DataFrame ready for analysis.

Usage:
    python data_cleaning.py data/sample_retail_data.csv
"""

import sys
import pandas as pd

EXPECTED_COLUMNS = [
    "Date", "Product", "Category", "Quantity",
    "SellingPrice", "CostPrice", "Region", "Customer",
]


def load_and_validate(path: str) -> pd.DataFrame:
    """Load CSV and validate expected columns are present."""
    df = pd.read_csv(path)
    missing = [c for c in EXPECTED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    return df


def data_quality_report(df: pd.DataFrame) -> dict:
    """Return a summary of data quality issues."""
    report = {
        "total_rows": len(df),
        "missing_values": int(df[EXPECTED_COLUMNS].isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "invalid_dates": 0,
        "invalid_numbers": 0,
    }

    # Date validation
    date_errors = pd.to_datetime(df["Date"], errors="coerce").isna() & df["Date"].notna()
    report["invalid_dates"] = int(date_errors.sum())

    # Numeric validation
    for col in ["Quantity", "SellingPrice", "CostPrice"]:
        invalid = pd.to_numeric(df[col], errors="coerce").isna() & df[col].notna()
        report["invalid_numbers"] += int(invalid.sum())

    return report


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Apply cleaning steps: drop duplicates, fill/drop missing, fix types."""
    df = df.drop_duplicates().copy()

    # Drop rows with any missing values in required columns
    df = df.dropna(subset=EXPECTED_COLUMNS)

    # Convert types
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"])  # remove rows with invalid dates

    df["Quantity"] = pd.to_numeric(df["Quantity"], errors="coerce")
    df["SellingPrice"] = pd.to_numeric(df["SellingPrice"], errors="coerce")
    df["CostPrice"] = pd.to_numeric(df["CostPrice"], errors="coerce")
    df = df.dropna(subset=["Quantity", "SellingPrice", "CostPrice"])

    # Remove negative numeric values (invalid for sales data)
    df = df[(df["Quantity"] >= 0) & (df["SellingPrice"] >= 0) & (df["CostPrice"] >= 0)]

    # Derived columns
    df["Revenue"] = df["Quantity"] * df["SellingPrice"]
    df["Cost"] = df["Quantity"] * df["CostPrice"]
    df["Profit"] = df["Revenue"] - df["Cost"]
    df["Margin"] = df["Profit"] / df["Revenue"]
    df["Month"] = df["Date"].dt.to_period("M").astype(str)

    return df.reset_index(drop=True)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/sample_retail_data.csv"
    print(f"Loading: {path}")
    raw = load_and_validate(path)
    print(f"\n--- Data Quality Report ---")
    report = data_quality_report(raw)
    for k, v in report.items():
        print(f"  {k:20s}: {v}")

    cleaned = clean(raw)
    print(f"\n--- After Cleaning ---")
    print(f"  Rows: {len(cleaned)} (removed {len(raw) - len(cleaned)})")
    print(f"  Date range: {cleaned['Date'].min().date()} → {cleaned['Date'].max().date()}")
    print(f"  Products: {cleaned['Product'].nunique()} | Categories: {cleaned['Category'].nunique()}")
    print(f"  Total revenue: ₹{cleaned['Revenue'].sum():,.0f}")
    print(f"  Total profit:  ₹{cleaned['Profit'].sum():,.0f}")

    cleaned.to_csv("data/cleaned_retail_data.csv", index=False)
    print(f"\nSaved cleaned data → data/cleaned_retail_data.csv")
    return cleaned


if __name__ == "__main__":
    main()
