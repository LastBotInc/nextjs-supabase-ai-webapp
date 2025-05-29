-- Add featured_image column to products table
ALTER TABLE products 
ADD COLUMN featured_image text;

COMMENT ON COLUMN products.featured_image IS 'URL of the featured image for the product';
