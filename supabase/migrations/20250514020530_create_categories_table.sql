CREATE TABLE categories (
    id bigserial PRIMARY KEY,
    shopify_collection_id bigint UNIQUE,
    title text NOT NULL,
    handle text UNIQUE NOT NULL,
    description_html text,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE categories IS 'Stores product categories (collections in Shopify).';
COMMENT ON COLUMN categories.shopify_collection_id IS 'Shopify Collection ID for syncing.';

CREATE TABLE product_categories (
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id bigint NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

COMMENT ON TABLE product_categories IS 'Join table for many-to-many relationship between products and categories.';

-- Trigger to update updated_at timestamp for categories
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); -- Assumes update_updated_at_column function is created from previous migration

-- Indexes
CREATE INDEX idx_categories_handle ON categories(handle);
CREATE INDEX idx_categories_shopify_collection_id ON categories(shopify_collection_id);
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read product_categories linkage" ON product_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage product_categories linkage" ON product_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
