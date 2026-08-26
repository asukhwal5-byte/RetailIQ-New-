-- ============================================================
-- RetailIQ — Database Schema
-- ============================================================
-- Schema for a retail sales analytics platform.
-- Run this first to create tables before running business_queries.sql.
-- ============================================================

-- Drop existing tables (safe for fresh setup)
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

-- ----------------------------------------------------------------
-- products: master product catalog
-- ----------------------------------------------------------------
CREATE TABLE products (
    product_id    SERIAL PRIMARY KEY,
    product_name  VARCHAR(200) NOT NULL,
    category      VARCHAR(100) NOT NULL,
    base_price    NUMERIC(10, 2) DEFAULT 0,
    cost_ratio    NUMERIC(5, 4)  DEFAULT 0.50  -- cost as fraction of selling price
);

-- ----------------------------------------------------------------
-- customers: customer master
-- ----------------------------------------------------------------
CREATE TABLE customers (
    customer_id   SERIAL PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    region        VARCHAR(50)  NOT NULL,
    segment       VARCHAR(50)  DEFAULT 'Retail'  -- Retail, Wholesale, Online, Corporate
);

-- ----------------------------------------------------------------
-- sales: individual transaction records
-- ----------------------------------------------------------------
CREATE TABLE sales (
    sale_id        SERIAL PRIMARY KEY,
    sale_date      DATE NOT NULL,
    product_id     INTEGER NOT NULL REFERENCES products(product_id),
    customer_id    INTEGER NOT NULL REFERENCES customers(customer_id),
    quantity       INTEGER NOT NULL CHECK (quantity >= 0),
    selling_price  NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
    cost_price     NUMERIC(10, 2) NOT NULL CHECK (cost_price >= 0),
    -- Derived (computed at insert time for query convenience)
    revenue        NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * selling_price) STORED,
    cost           NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * cost_price) STORED,
    profit         NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * (selling_price - cost_price)) STORED
);

-- Indexes for common query patterns
CREATE INDEX idx_sales_date      ON sales(sale_date);
CREATE INDEX idx_sales_product   ON sales(product_id);
CREATE INDEX idx_sales_customer  ON sales(customer_id);
CREATE INDEX idx_sales_date_prod ON sales(sale_date, product_id);

-- ----------------------------------------------------------------
-- inventory: current stock levels per product
-- ----------------------------------------------------------------
CREATE TABLE inventory (
    product_id    INTEGER PRIMARY KEY REFERENCES products(product_id),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    lead_time_days     INTEGER DEFAULT 7,
    safety_stock_days  INTEGER DEFAULT 7
);

-- ----------------------------------------------------------------
-- Example: insert a product and a sale
-- ----------------------------------------------------------------
-- INSERT INTO products (product_name, category, base_price, cost_ratio)
-- VALUES ('Wireless Mouse', 'Electronics', 799.00, 0.62);
--
-- INSERT INTO sales (sale_date, product_id, customer_id, quantity, selling_price, cost_price)
-- VALUES ('2024-01-15', 1, 1, 10, 799.00, 495.00);
