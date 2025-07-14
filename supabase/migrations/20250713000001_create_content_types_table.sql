-- Create content_types table
CREATE TABLE IF NOT EXISTS content_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  
  -- Style and tone settings that can override brand defaults
  tone_formal INTEGER CHECK (tone_formal >= 0 AND tone_formal <= 10),
  tone_friendly INTEGER CHECK (tone_friendly >= 0 AND tone_friendly <= 10),
  tone_technical INTEGER CHECK (tone_technical >= 0 AND tone_technical <= 10),
  tone_innovative INTEGER CHECK (tone_innovative >= 0 AND tone_innovative <= 10),
  
  -- Content structure
  typical_length_min INTEGER DEFAULT 500,
  typical_length_max INTEGER DEFAULT 2000,
  structure_template TEXT[], -- e.g., ['introduction', 'main_points', 'conclusion']
  
  -- Writing guidelines specific to this content type
  writing_guidelines TEXT[],
  example_titles TEXT[],
  keywords TEXT[],
  
  -- SEO settings
  meta_description_template TEXT,
  
  -- Usage settings
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System content types cannot be deleted
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes
CREATE INDEX idx_content_types_brand_id ON content_types(brand_id);
CREATE INDEX idx_content_types_slug ON content_types(slug);
CREATE INDEX idx_content_types_is_active ON content_types(is_active);

-- Enable RLS
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to see all active content types (public read)
CREATE POLICY "Public content types are viewable by everyone"
  ON content_types FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to see all content types in their brands
CREATE POLICY "Users can view all content types in their brands"
  ON content_types FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM brands WHERE id = content_types.brand_id
    )
  );

-- Allow users to create content types for their brands
CREATE POLICY "Users can create content types for their brands"
  ON content_types FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM brands WHERE id = content_types.brand_id
    )
  );

-- Allow users to update their own content types (but not system ones)
CREATE POLICY "Users can update their own content types"
  ON content_types FOR UPDATE
  USING (
    is_system = false AND
    auth.uid() IN (
      SELECT user_id FROM brands WHERE id = content_types.brand_id
    )
  );

-- Allow users to delete their own content types (but not system ones)
CREATE POLICY "Users can delete their own content types"
  ON content_types FOR DELETE
  USING (
    is_system = false AND
    auth.uid() IN (
      SELECT user_id FROM brands WHERE id = content_types.brand_id
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_types_updated_at
  BEFORE UPDATE ON content_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();