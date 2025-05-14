ALTER TABLE data_sources
ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;

-- Optionally, add a comment to the column
COMMENT ON COLUMN data_sources.status IS 'The current status of the data source, e.g., active, inactive, error';

ALTER TABLE data_sources
RENAME COLUMN source_type TO feed_type;

COMMENT ON COLUMN data_sources.feed_type IS 'The type of the data source feed, e.g., product_feed, inventory_feed';
