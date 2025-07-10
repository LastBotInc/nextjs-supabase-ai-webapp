-- Add missing language columns to analytics_events table
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS browser_language TEXT;

-- Add indexes for the new columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_language ON analytics_events(language);
CREATE INDEX IF NOT EXISTS idx_analytics_events_browser_language ON analytics_events(browser_language);

-- Update existing records to have default language values where null
UPDATE analytics_events 
SET language = 'en' 
WHERE language IS NULL;

UPDATE analytics_events 
SET browser_language = 'en' 
WHERE browser_language IS NULL;
