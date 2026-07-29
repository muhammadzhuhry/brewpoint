CREATE INDEX idx_products_name        ON products USING GIN (to_tsvector('simple', name));
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active   ON products(is_active);

CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_status     ON transactions(status);

CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id     ON transaction_items(product_id);

CREATE INDEX idx_stock_adjustments_product_id ON stock_adjustments(product_id);
