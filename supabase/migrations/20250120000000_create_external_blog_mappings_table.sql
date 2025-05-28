CREATE TABLE external_blog_mappings (
    id bigserial PRIMARY KEY,
    internal_post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    external_source_name text NOT NULL, -- e.g., 'shopify', 'wordpress', 'contentful'
    external_blog_id text NOT NULL, -- Blog ID in the external system (e.g., Shopify Blog GID)
    external_article_id text NOT NULL, -- Article ID in the external system (e.g., Shopify Article GID)
    sync_status text DEFAULT 'synced', -- e.g., 'synced', 'pending', 'error'
    last_synced_at timestamptz DEFAULT now(),
    meta_data jsonb, -- Store additional metadata like original URLs, author info, etc.
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (internal_post_id, external_source_name),
    UNIQUE (external_source_name, external_blog_id, external_article_id)
);

COMMENT ON TABLE external_blog_mappings IS 'Maps internal blog post IDs to IDs from external systems like Shopify, WordPress, etc.';
COMMENT ON COLUMN external_blog_mappings.internal_post_id IS 'Reference to the post in the local posts table.';
COMMENT ON COLUMN external_blog_mappings.external_source_name IS 'Identifier for the external system (e.g., shopify).';
COMMENT ON COLUMN external_blog_mappings.external_blog_id IS 'Blog ID in the external system.';
COMMENT ON COLUMN external_blog_mappings.external_article_id IS 'Article ID in the external system.';

-- Trigger for updated_at
CREATE TRIGGER update_external_blog_mappings_updated_at
BEFORE UPDATE ON external_blog_mappings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_blog_mappings_internal_post_id ON external_blog_mappings(internal_post_id);
CREATE INDEX idx_blog_mappings_external_source_article_id ON external_blog_mappings(external_source_name, external_article_id);
CREATE INDEX idx_blog_mappings_external_source_blog_id ON external_blog_mappings(external_source_name, external_blog_id);

-- Enable RLS
ALTER TABLE external_blog_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin-only for now)
CREATE POLICY "Admins can manage blog mappings" ON external_blog_mappings
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)); 