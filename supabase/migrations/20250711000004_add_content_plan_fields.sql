-- Add fields to content_calendar for storing content plans
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS planned_title TEXT,
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS content_type_id UUID,
ADD COLUMN IF NOT EXISTS multiple_persona_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_topics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['en'];

-- Foreign key for content_type_id will be added in a later migration after content_types table is created

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_type_id ON content_calendar(content_type_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status_date ON content_calendar(status, date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_languages ON content_calendar USING GIN(languages);

-- Update existing entries to have at least one language
UPDATE content_calendar 
SET languages = ARRAY[locale] 
WHERE languages IS NULL OR array_length(languages, 1) IS NULL;

-- Comment on new columns
COMMENT ON COLUMN content_calendar.planned_title IS 'AI generated title for the content plan';
COMMENT ON COLUMN content_calendar.generation_prompt IS 'AI generated detailed prompt for content generation';
COMMENT ON COLUMN content_calendar.content_type_id IS 'Reference to content_types table for structured content generation';
COMMENT ON COLUMN content_calendar.multiple_persona_ids IS 'Array of persona IDs when content targets multiple personas';
COMMENT ON COLUMN content_calendar.custom_topics IS 'Additional custom topics beyond the main topic';
COMMENT ON COLUMN content_calendar.languages IS 'Languages in which this content should be generated';