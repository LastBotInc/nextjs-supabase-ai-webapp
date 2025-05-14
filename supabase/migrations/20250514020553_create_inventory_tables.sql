CREATE TABLE locations (
    id bigserial PRIMARY KEY,
    shopify_location_id bigint UNIQUE,
    name text NOT NULL,
    address1 text,
    address2 text,
    city text,
    zip text,
    province text,
    country_code text, -- ISO 3166-1 alpha-2
    phone text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE locations IS 'Stores physical or virtual locations where inventory is held.';
COMMENT ON COLUMN locations.shopify_location_id IS 'Shopify Location ID for syncing.';

CREATE TABLE inventory_items (
    id bigserial PRIMARY KEY,
    shopify_inventory_item_id bigint UNIQUE,
    variant_id bigint UNIQUE NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    sku text, -- Denormalized from product_variants for convenience
    tracked boolean DEFAULT true,
    cost decimal(10,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE inventory_items IS 'Represents an item whose inventory is tracked.';
COMMENT ON COLUMN inventory_items.shopify_inventory_item_id IS 'Shopify Inventory Item ID.';
COMMENT ON COLUMN inventory_items.variant_id IS 'Link to the specific product variant.';

CREATE TABLE inventory_levels (
    inventory_item_id bigint NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id bigint NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    available_quantity integer DEFAULT 0,
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (inventory_item_id, location_id)
);

COMMENT ON TABLE inventory_levels IS 'Tracks the quantity of an inventory item at a specific location.';

-- Triggers for updated_at
CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_levels_updated_at
BEFORE UPDATE ON inventory_levels
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_locations_shopify_location_id ON locations(shopify_location_id);
CREATE INDEX idx_inventory_items_shopify_inventory_item_id ON inventory_items(shopify_inventory_item_id);
CREATE INDEX idx_inventory_items_variant_id ON inventory_items(variant_id);
CREATE INDEX idx_inventory_levels_location_id ON inventory_levels(location_id);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin-only for now)
CREATE POLICY "Admins can manage locations" ON locations
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage inventory_items" ON inventory_items
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage inventory_levels" ON inventory_levels
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Allow authenticated users to read location (e.g. for store pickup options)
CREATE POLICY "Authenticated users can read locations" ON locations
    FOR SELECT USING (auth.role() = 'authenticated');
