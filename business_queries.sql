-- ============================================================
-- RetailIQ — Business Analytics Queries
-- ============================================================
-- Professional SQL queries for retail sales analytics.
-- Assumes the schema from schema.sql is already created.
-- ============================================================

-- 1. Total Revenue, Profit, and Profit Margin
--    margin = profit / revenue * 100
SELECT
    SUM(revenue)                                    AS total_revenue,
    SUM(profit)                                     AS total_profit,
    ROUND(SUM(profit) / NULLIF(SUM(revenue), 0) * 100, 2) AS profit_margin_pct,
    COUNT(*)                                        AS total_orders,
    SUM(quantity)                                   AS units_sold,
    ROUND(SUM(revenue) / NULLIF(COUNT(*), 0), 2)    AS avg_order_value
FROM sales;


-- 2. Monthly Sales Trend (revenue, profit, margin per month)
SELECT
    TO_CHAR(sale_date, 'YYYY-MM')                          AS month,
    SUM(revenue)                                           AS revenue,
    SUM(profit)                                            AS profit,
    SUM(quantity)                                          AS units_sold,
    COUNT(*)                                               AS orders,
    ROUND(SUM(profit) / NULLIF(SUM(revenue), 0) * 100, 2)  AS margin_pct
FROM sales
GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
ORDER BY month;


-- 3. Month-over-Month Growth Rate
--    growth = (curr - prev) / prev * 100
WITH monthly AS (
    SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        SUM(revenue)                  AS revenue
    FROM sales
    GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
)
SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
    ROUND(
        (revenue - LAG(revenue) OVER (ORDER BY month))
        / NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100,
        2
    ) AS mom_growth_pct
FROM monthly
ORDER BY month;


-- 4. Top 10 Products by Revenue
SELECT
    p.product_name,
    p.category,
    SUM(s.quantity)                                      AS units_sold,
    SUM(s.revenue)                                       AS revenue,
    SUM(s.profit)                                        AS profit,
    ROUND(SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100, 2) AS margin_pct
FROM sales s
JOIN products p ON s.product_id = p.product_id
GROUP BY p.product_name, p.category
ORDER BY revenue DESC
LIMIT 10;


-- 5. Category Performance
SELECT
    p.category,
    SUM(s.revenue)                                       AS revenue,
    SUM(s.profit)                                        AS profit,
    SUM(s.quantity)                                      AS units_sold,
    COUNT(*)                                             AS orders,
    ROUND(SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100, 2) AS margin_pct
FROM sales s
JOIN products p ON s.product_id = p.product_id
GROUP BY p.category
ORDER BY revenue DESC;


-- 6. Regional Performance
SELECT
    c.region,
    SUM(s.revenue)                                       AS revenue,
    SUM(s.profit)                                        AS profit,
    SUM(s.quantity)                                      AS units_sold,
    ROUND(SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100, 2) AS margin_pct
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY c.region
ORDER BY revenue DESC;


-- 7. Low Margin Products (margin below portfolio average)
WITH portfolio_avg AS (
    SELECT SUM(profit) / NULLIF(SUM(revenue), 0) * 100 AS avg_margin
    FROM sales
)
SELECT
    p.product_name,
    p.category,
    SUM(s.revenue)  AS revenue,
    SUM(s.profit)   AS profit,
    ROUND(SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100, 2) AS margin_pct
FROM sales s
JOIN products p ON s.product_id = p.product_id
CROSS JOIN portfolio_avg
GROUP BY p.product_name, p.category, portfolio_avg.avg_margin
HAVING SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100 < portfolio_avg.avg_margin * 0.75
ORDER BY margin_pct ASC;


-- 8. Inventory Analysis — Stock Cover & Reorder Point
--    avg_daily_sales = total units / date span
--    days_remaining  = current_stock / avg_daily_sales
--    reorder_point   = avg_daily_sales * (lead_time + safety_stock)
WITH product_sales AS (
    SELECT
        s.product_id,
        SUM(s.quantity) AS total_units,
        (MAX(s.sale_date) - MIN(s.sale_date)) AS span_days
    FROM sales s
    GROUP BY s.product_id
),
daily_avg AS (
    SELECT
        ps.product_id,
        ps.total_units / NULLIF(ps.span_days, 0) AS avg_daily_sales
    FROM product_sales ps
)
SELECT
    p.product_name,
    p.category,
    i.current_stock,
    ROUND(da.avg_daily_sales, 1)                        AS avg_daily_sales,
    ROUND(i.current_stock / NULLIF(da.avg_daily_sales, 0), 1) AS days_remaining,
    ROUND(da.avg_daily_sales * (i.lead_time_days + i.safety_stock_days)) AS reorder_point,
    CASE
        WHEN i.current_stock / NULLIF(da.avg_daily_sales, 0) < 7  THEN 'CRITICAL'
        WHEN i.current_stock / NULLIF(da.avg_daily_sales, 0) < 21 THEN 'LOW STOCK'
        WHEN i.current_stock / NULLIF(da.avg_daily_sales, 0) > 90 THEN 'OVERSTOCKED'
        ELSE 'HEALTHY'
    END AS stock_status
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN daily_avg da ON i.product_id = da.product_id
ORDER BY days_remaining ASC;


-- 9. Customer Analysis — Top Customers
SELECT
    c.customer_name,
    c.segment,
    c.region,
    SUM(s.revenue)                                       AS revenue,
    SUM(s.profit)                                        AS profit,
    COUNT(*)                                             AS orders,
    ROUND(SUM(s.revenue) / NULLIF(COUNT(*), 0), 2)       AS avg_order_value,
    ROUND(SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100, 2) AS margin_pct
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY c.customer_name, c.segment, c.region
ORDER BY revenue DESC
LIMIT 20;


-- 10. Customer Segment Performance
SELECT
    c.segment,
    SUM(s.revenue)                                       AS revenue,
    SUM(s.profit)                                        AS profit,
    COUNT(*)                                             AS orders,
    ROUND(SUM(s.revenue) / NULLIF(COUNT(*), 0), 2)       AS avg_order_value,
    ROUND(SUM(s.profit) / NULLIF(SUM(s.revenue), 0) * 100, 2) AS margin_pct
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY revenue DESC;


-- 11. Anomaly Detection — Daily Units Outside IQR Fences
--    IQR = Q3 - Q1; fences = [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
WITH daily AS (
    SELECT sale_date, SUM(quantity) AS daily_units
    FROM sales
    GROUP BY sale_date
),
stats AS (
    SELECT
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY daily_units) AS q1,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY daily_units) AS q3
    FROM daily
)
SELECT
    d.sale_date,
    d.daily_units,
    ROUND(s.q1 - 1.5 * (s.q3 - s.q1), 1) AS lower_fence,
    ROUND(s.q3 + 1.5 * (s.q3 - s.q1), 1) AS upper_fence,
    CASE
        WHEN d.daily_units > s.q3 + 1.5 * (s.q3 - s.q1) THEN 'High spike'
        ELSE 'Low dip'
    END AS anomaly_type
FROM daily d
CROSS JOIN stats s
WHERE d.daily_units < s.q1 - 1.5 * (s.q3 - s.q1)
   OR d.daily_units > s.q3 + 1.5 * (s.q3 - s.q1)
ORDER BY ABS(d.daily_units - (s.q1 + s.q3) / 2) DESC;
