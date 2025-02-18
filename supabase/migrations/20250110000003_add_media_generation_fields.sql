-- Add generation-related fields to media_assets table
ALTER TABLE media_assets
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS style TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'generated')),
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert their own media assets" ON media_assets;

-- Create new policy with source check
CREATE POLICY "Users can insert their own media assets" ON media_assets
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  source IN ('upload', 'generated')
); 