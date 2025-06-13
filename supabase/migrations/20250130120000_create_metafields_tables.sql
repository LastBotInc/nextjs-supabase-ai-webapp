-- Create metafield_definitions table
CREATE TABLE metafield_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    name text NOT NULL,
    namespace text NOT NULL,
    key text NOT NULL,
    owner_type text NOT NULL CHECK (owner_type IN ('PRODUCT', 'COLLECTION', 'ARTICLE', 'BLOG', 'PAGE', 'CUSTOMER', 'ORDER', 'DRAFT_ORDER', 'COMPANY', 'COMPANY_LOCATION', 'LOCATION')),
    metafield_type text NOT NULL,
    description text,
    validation_rules jsonb,
    shopify_definition_id text,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    storefront_visible boolean DEFAULT false,
    auto_generated boolean DEFAULT false,
    source_identifier text
);

-- Add unique constraint on namespace + key + owner_type
CREATE UNIQUE INDEX idx_metafield_definitions_unique ON metafield_definitions(namespace, key, owner_type);

-- Create indexes
CREATE INDEX idx_metafield_definitions_owner_type ON metafield_definitions(owner_type);
CREATE INDEX idx_metafield_definitions_namespace ON metafield_definitions(namespace);
CREATE INDEX idx_metafield_definitions_shopify_id ON metafield_definitions(shopify_definition_id);
CREATE INDEX idx_metafield_definitions_auto_generated ON metafield_definitions(auto_generated);
CREATE INDEX idx_metafield_definitions_source ON metafield_definitions(source_identifier);

-- Add comments
COMMENT ON TABLE metafield_definitions IS 'Stores Shopify metafield definitions for various resource types';
COMMENT ON COLUMN metafield_definitions.namespace IS 'Shopify metafield namespace for grouping related metafields';
COMMENT ON COLUMN metafield_definitions.key IS 'Unique identifier for the metafield within its namespace';
COMMENT ON COLUMN metafield_definitions.owner_type IS 'The Shopify resource type this metafield can be attached to';
COMMENT ON COLUMN metafield_definitions.metafield_type IS 'The Shopify metafield type (e.g., single_line_text_field, json, etc.)';
COMMENT ON COLUMN metafield_definitions.validation_rules IS 'JSON object containing Shopify validation options';
COMMENT ON COLUMN metafield_definitions.shopify_definition_id IS 'The GID of the metafield definition in Shopify';
COMMENT ON COLUMN metafield_definitions.auto_generated IS 'Whether this definition was auto-generated from schema detection';
COMMENT ON COLUMN metafield_definitions.source_identifier IS 'Reference to the data source or schema that generated this definition';

-- Create metafield_mappings table
CREATE TABLE metafield_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metafield_definition_id uuid NOT NULL REFERENCES metafield_definitions(id) ON DELETE CASCADE,
    data_source_id bigint REFERENCES data_sources(id) ON DELETE CASCADE,
    external_field_name text NOT NULL,
    external_field_path text,
    transformation_rules jsonb,
    is_active boolean DEFAULT true
);

-- Create indexes
CREATE INDEX idx_metafield_mappings_definition ON metafield_mappings(metafield_definition_id);
CREATE INDEX idx_metafield_mappings_data_source ON metafield_mappings(data_source_id);
CREATE INDEX idx_metafield_mappings_field_name ON metafield_mappings(external_field_name);

-- Add comments
COMMENT ON TABLE metafield_mappings IS 'Maps external data source fields to Shopify metafield definitions';
COMMENT ON COLUMN metafield_mappings.external_field_name IS 'The name of the field in the external data source';
COMMENT ON COLUMN metafield_mappings.external_field_path IS 'JSON path for nested fields (e.g., product.specifications.weight)';
COMMENT ON COLUMN metafield_mappings.transformation_rules IS 'Rules for transforming external data to metafield values';

-- Create external_field_mappings table
CREATE TABLE external_field_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    data_source_id bigint NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    external_field_name text NOT NULL,
    external_field_type text,
    external_field_path text,
    shopify_field_type text,
    is_metafield_candidate boolean DEFAULT false,
    sample_values jsonb,
    frequency integer DEFAULT 0,
    created_by_detection boolean DEFAULT true
);

-- Add unique constraint
CREATE UNIQUE INDEX idx_external_field_mappings_unique ON external_field_mappings(data_source_id, external_field_name, external_field_path);

-- Create indexes
CREATE INDEX idx_external_field_mappings_data_source ON external_field_mappings(data_source_id);
CREATE INDEX idx_external_field_mappings_metafield_candidate ON external_field_mappings(is_metafield_candidate);
CREATE INDEX idx_external_field_mappings_shopify_field ON external_field_mappings(shopify_field_type);

-- Add comments
COMMENT ON TABLE external_field_mappings IS 'Tracks fields from external data sources and their mapping to Shopify fields or metafields';
COMMENT ON COLUMN external_field_mappings.external_field_type IS 'The detected data type of the external field';
COMMENT ON COLUMN external_field_mappings.shopify_field_type IS 'Standard Shopify field this maps to, if any';
COMMENT ON COLUMN external_field_mappings.is_metafield_candidate IS 'Whether this field should become a custom metafield';
COMMENT ON COLUMN external_field_mappings.sample_values IS 'Sample values from the external source for type analysis';
COMMENT ON COLUMN external_field_mappings.frequency IS 'How often this field appears across records in the data source';

-- Create metafield_values table
CREATE TABLE metafield_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metafield_definition_id uuid NOT NULL REFERENCES metafield_definitions(id) ON DELETE CASCADE,
    resource_type text NOT NULL,
    resource_id text NOT NULL,
    shopify_resource_gid text,
    shopify_metafield_id text,
    value text,
    parsed_value jsonb,
    sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error')),
    sync_error text,
    last_synced_at timestamptz
);

-- Add unique constraint on metafield + resource
CREATE UNIQUE INDEX idx_metafield_values_unique ON metafield_values(metafield_definition_id, resource_type, resource_id);

-- Create indexes
CREATE INDEX idx_metafield_values_definition ON metafield_values(metafield_definition_id);
CREATE INDEX idx_metafield_values_resource ON metafield_values(resource_type, resource_id);
CREATE INDEX idx_metafield_values_shopify_resource ON metafield_values(shopify_resource_gid);
CREATE INDEX idx_metafield_values_shopify_metafield ON metafield_values(shopify_metafield_id);
CREATE INDEX idx_metafield_values_sync_status ON metafield_values(sync_status);

-- Add comments
COMMENT ON TABLE metafield_values IS 'Stores metafield values for various Shopify resources';
COMMENT ON COLUMN metafield_values.resource_type IS 'The type of resource (PRODUCT, COLLECTION, etc.)';
COMMENT ON COLUMN metafield_values.resource_id IS 'Internal ID of the resource';
COMMENT ON COLUMN metafield_values.shopify_resource_gid IS 'Shopify GID of the resource';
COMMENT ON COLUMN metafield_values.shopify_metafield_id IS 'Shopify GID of the metafield instance';
COMMENT ON COLUMN metafield_values.value IS 'The metafield value (always stored as text per Shopify API)';
COMMENT ON COLUMN metafield_values.parsed_value IS 'Parsed value for complex types like JSON, dimensions, etc.';
COMMENT ON COLUMN metafield_values.sync_status IS 'Status of synchronization with Shopify';

-- Create update triggers
CREATE TRIGGER update_metafield_definitions_updated_at
    BEFORE UPDATE ON metafield_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metafield_mappings_updated_at
    BEFORE UPDATE ON metafield_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_field_mappings_updated_at
    BEFORE UPDATE ON external_field_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metafield_values_updated_at
    BEFORE UPDATE ON metafield_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE metafield_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metafield_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE metafield_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for metafield_definitions
CREATE POLICY "Admins can manage metafield definitions" ON metafield_definitions
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

CREATE POLICY "Public can view active metafield definitions" ON metafield_definitions
    FOR SELECT
    USING (is_active = true);

-- RLS Policies for metafield_mappings
CREATE POLICY "Admins can manage metafield mappings" ON metafield_mappings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for external_field_mappings
CREATE POLICY "Admins can manage external field mappings" ON external_field_mappings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for metafield_values
CREATE POLICY "Admins can manage metafield values" ON metafield_values
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Public can view synced metafield values" ON metafield_values
    FOR SELECT
    USING (sync_status = 'synced'); 