-- Create product_images table to store product images from Shopify
CREATE TABLE product_images (
    id bigserial PRIMARY KEY,
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    shopify_image_id text UNIQUE,
    url text NOT NULL,
    alt_text text,
    position integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE product_images IS 'Stores product images synced from Shopify.';
COMMENT ON COLUMN product_images.shopify_image_id IS 'Shopify Image ID for syncing.';
COMMENT ON COLUMN product_images.position IS 'Display order of the image (0 = primary image).';

-- Add trigger for updated_at
CREATE TRIGGER update_product_images_updated_at
BEFORE UPDATE ON product_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_shopify_id ON product_images(shopify_image_id);
CREATE INDEX idx_product_images_position ON product_images(product_id, position);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read product images" ON product_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images" ON product_images
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