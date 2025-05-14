CREATE TABLE external_product_mappings (
    id bigserial PRIMARY KEY,
    internal_product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    external_source_name text NOT NULL, -- e.g., 'Shopify', 'ERP_XYZ', 'Amazon'
    external_product_id text NOT NULL, -- Storing as text to accommodate various ID formats
    external_variant_id text, -- If mapping is at variant level for this source
    sync_status text, -- e.g., 'synced', 'pending', 'error'
    last_synced_at timestamptz,
    meta_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (internal_product_id, external_source_name),
    UNIQUE (external_source_name, external_product_id, external_variant_id) -- Consider partial index if external_variant_id is often NULL
);

COMMENT ON TABLE external_product_mappings IS 'Maps internal product IDs to IDs from external systems like Shopify, ERPs, etc.';
COMMENT ON COLUMN external_product_mappings.internal_product_id IS 'Reference to the product in the local products table.';
COMMENT ON COLUMN external_product_mappings.external_source_name IS 'Identifier for the external system (e.g., Shopify).';
COMMENT ON COLUMN external_product_mappings.external_product_id IS 'Product ID in the external system.';
COMMENT ON COLUMN external_product_mappings.external_variant_id IS 'Variant ID in the external system, if applicable.';

-- Trigger for updated_at
CREATE TRIGGER update_external_product_mappings_updated_at
BEFORE UPDATE ON external_product_mappings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_mappings_internal_product_id ON external_product_mappings(internal_product_id);
CREATE INDEX idx_mappings_external_source_product_id ON external_product_mappings(external_source_name, external_product_id);
CREATE INDEX idx_mappings_external_source_variant_id ON external_product_mappings(external_source_name, external_variant_id) WHERE external_variant_id IS NOT NULL;

-- Enable RLS
ALTER TABLE external_product_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin-only for now)
CREATE POLICY "Admins can manage product mappings" ON external_product_mappings
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
