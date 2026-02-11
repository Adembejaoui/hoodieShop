-- Performance Indexes for Hoodie Legends E-commerce
-- Run this migration to optimize query performance
-- 
-- Execute with: npx prisma db execute --file prisma/migrations/001_add_performance_indexes.sql
-- Or via psql/supabase SQL editor

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed ON orders(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Variants table indexes (for inventory lookups)
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_stock ON variants(stock_qty);

-- Product colors table indexes
CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);

-- Product size stocks table indexes
CREATE INDEX IF NOT EXISTS idx_product_size_stocks_product ON product_size_stocks(product_id);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(is_blocked);

-- Coupons table indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);

-- Full text search indexes (if using PostgreSQL full text search)
-- CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
-- CREATE INDEX IF NOT EXISTS idx_products_desc_search ON products USING gin(to_tsvector('english', description));

-- Comment on indexes for documentation
COMMENT ON INDEX idx_products_category IS 'Optimizes product listings by category';
COMMENT ON INDEX idx_products_slug IS 'Optimizes single product lookups';
COMMENT ON INDEX idx_orders_user IS 'Optimizes user order history queries';
COMMENT ON INDEX idx_orders_status IS 'Optimizes admin order filtering';
COMMENT ON INDEX idx_variants_product_color_size IS 'Optimizes inventory lookups during checkout';
