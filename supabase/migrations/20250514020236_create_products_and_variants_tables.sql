CREATE TABLE products (
    id bigserial PRIMARY KEY,
    shopify_product_id bigint UNIQUE,
    title text NOT NULL,
    handle text UNIQUE NOT NULL,
    description_html text,
    vendor text,
    product_type text,
    status text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    published_at timestamptz
);

COMMENT ON TABLE products IS 'Stores product information, mirroring Shopify products.';
COMMENT ON COLUMN products.shopify_product_id IS 'Shopify Product ID for syncing.';
COMMENT ON COLUMN products.handle IS 'URL-friendly identifier for the product.';
COMMENT ON COLUMN products.status IS 'Product status: active, draft, or archived.';

CREATE TABLE product_variants (
    id bigserial PRIMARY KEY,
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    shopify_variant_id bigint UNIQUE,
    title text NOT NULL,
    sku text UNIQUE,
    barcode text,
    price decimal(10, 2) NOT NULL,
    compare_at_price decimal(10, 2),
    option1 text,
    option2 text,
    option3 text,
    -- Consider a separate images table or storing image URLs directly
    -- image_id bigint, 
    inventory_quantity integer DEFAULT 0,
    inventory_policy text DEFAULT 'deny' CHECK (inventory_policy IN ('deny', 'continue')),
    weight decimal(10, 2),
    weight_unit text,
    requires_shipping boolean DEFAULT true,
    taxable boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE product_variants IS 'Stores product variant information, linked to products.';
COMMENT ON COLUMN product_variants.shopify_variant_id IS 'Shopify Variant ID for syncing.';
COMMENT ON COLUMN product_variants.sku IS 'Stock Keeping Unit.';
COMMENT ON COLUMN product_variants.inventory_policy IS 'Inventory policy: deny or continue selling when out of stock.';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for frequently queried columns
CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_shopify_product_id ON products(shopify_product_id);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_shopify_variant_id ON product_variants(shopify_variant_id);

-- Enable RLS for the tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed based on add-data-model.mdc)
-- For now, allowing public read access. More specific policies should be added later.
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read product variants" ON product_variants FOR SELECT USING (true);

-- Admin access for all operations (assuming an is_admin check in profiles table)
CREATE POLICY "Admins can manage products" ON products
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

CREATE POLICY "Admins can manage product variants" ON product_variants
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
