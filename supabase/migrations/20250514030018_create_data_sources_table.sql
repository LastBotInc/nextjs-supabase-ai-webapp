CREATE TABLE data_sources (
    id bigserial PRIMARY KEY,
    name text NOT NULL,                        -- e.g., "Caffitella Product Feed", from schema_detector output
    identifier text UNIQUE NOT NULL,           -- e.g., "caffitella_product_feed", from schema_detector output
    description text,                          -- from schema_detector output
    feed_url text UNIQUE NOT NULL,             -- URL of the data source (e.g., product feed)
    source_type text,                          -- e.g., 'product_feed', 'inventory_feed', 'customer_data'
    vendor_name text,                          -- Extracted vendor name from URL or manually set
    detected_schema jsonb,                     -- Stores the JSON schema detected by schema-detector.ts (the "json_schema" field's content)
    last_fetched_at timestamptz,               -- Timestamp of when the feed content was last successfully fetched
    last_schema_update_at timestamptz,         -- Timestamp of when the schema was last detected/updated
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE data_sources IS 'Stores information about various data sources, their feed URLs, and detected JSON schemas.';
COMMENT ON COLUMN data_sources.name IS 'Human-readable name for the data source.';
COMMENT ON COLUMN data_sources.identifier IS 'Filesystem-friendly unique identifier for the data source.';
COMMENT ON COLUMN data_sources.feed_url IS 'URL of the data feed.';
COMMENT ON COLUMN data_sources.source_type IS 'Category of the data source (e.g., product_feed).';
COMMENT ON COLUMN data_sources.vendor_name IS 'Name of the vendor associated with the data source.';
COMMENT ON COLUMN data_sources.detected_schema IS 'The JSON schema describing the structure of the items in the feed.';
COMMENT ON COLUMN data_sources.last_fetched_at IS 'Timestamp of the last successful fetch of feed content.';
COMMENT ON COLUMN data_sources.last_schema_update_at IS 'Timestamp of the last schema detection/update.';

-- Trigger to update updated_at timestamp
-- Assumes update_updated_at_column function is created from a previous migration (e.g., create_products_and_variants_tables.sql)
CREATE TRIGGER update_data_sources_updated_at
BEFORE UPDATE ON data_sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for frequently queried columns
CREATE INDEX idx_data_sources_identifier ON data_sources(identifier);
CREATE INDEX idx_data_sources_feed_url ON data_sources(feed_url);
CREATE INDEX idx_data_sources_source_type ON data_sources(source_type);
CREATE INDEX idx_data_sources_vendor_name ON data_sources(vendor_name);

-- Enable RLS for the table
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin-only for now for all operations)
CREATE POLICY "Admins can manage data sources" ON data_sources
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
