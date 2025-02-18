-- Create media assets table
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT,
    description TEXT,
    alt_text TEXT,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    original_url TEXT NOT NULL,
    optimized_url TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_generated BOOLEAN DEFAULT false,
    generation_prompt TEXT,
    generation_style TEXT
);

-- Create media variants table for generated images
CREATE TABLE media_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
    variant_type TEXT NOT NULL,
    url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create media usage tracking table
CREATE TABLE media_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    media_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    context TEXT
);

-- Add indexes
CREATE INDEX idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at);
CREATE INDEX idx_media_variants_parent_id ON media_variants(parent_id);
CREATE INDEX idx_media_usage_media_id ON media_usage(media_id);
CREATE INDEX idx_media_usage_entity ON media_usage(entity_type, entity_id);

-- Add RLS policies
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;

-- Storage bucket policy to link with media_assets
CREATE POLICY "Link storage objects with media assets"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
        bucket_id = 'media' 
        AND (
            EXISTS (
                SELECT 1 FROM media_assets 
                WHERE media_assets.original_url LIKE '%' || name
                AND media_assets.user_id = auth.uid()
            )
            OR owner IS NULL -- Allow initial upload
        )
    );

-- Media assets policies
CREATE POLICY "Media assets are viewable by everyone" 
    ON media_assets FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own media assets" 
    ON media_assets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media assets" 
    ON media_assets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media assets" 
    ON media_assets FOR DELETE 
    USING (auth.uid() = user_id);

-- Media variants policies
CREATE POLICY "Media variants are viewable by everyone" 
    ON media_variants FOR SELECT 
    USING (true);

CREATE POLICY "Users can manage variants of their media assets" 
    ON media_variants FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM media_assets 
        WHERE media_assets.id = media_variants.parent_id 
        AND media_assets.user_id = auth.uid()
    ));

-- Media usage policies
CREATE POLICY "Media usage is viewable by everyone" 
    ON media_usage FOR SELECT 
    USING (true);

CREATE POLICY "Users can track usage of their media assets" 
    ON media_usage FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM media_assets 
        WHERE media_assets.id = media_usage.media_id 
        AND media_assets.user_id = auth.uid()
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_media_assets_updated_at
    BEFORE UPDATE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 