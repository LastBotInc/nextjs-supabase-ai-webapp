-- Add internal_variant_id column to external_product_mappings table
-- This is needed to properly track mappings at the variant level

-- Add the new column
ALTER TABLE external_product_mappings 
ADD COLUMN internal_variant_id bigint REFERENCES product_variants(id) ON DELETE CASCADE;

-- Add comment for the new column
COMMENT ON COLUMN external_product_mappings.internal_variant_id IS 'Reference to the variant in the local product_variants table.';

-- Create an index for the new column
CREATE INDEX idx_mappings_internal_variant_id ON external_product_mappings(internal_variant_id);

-- Update the unique constraints to handle variant-level mappings properly
-- Drop the old unique constraint
ALTER TABLE external_product_mappings 
DROP CONSTRAINT IF EXISTS external_product_mappings_external_source_name_external_product_i_key;

-- Add new unique constraint that includes internal_variant_id
ALTER TABLE external_product_mappings 
ADD CONSTRAINT unique_external_mapping 
UNIQUE (external_source_name, external_product_id, external_variant_id, internal_variant_id);
