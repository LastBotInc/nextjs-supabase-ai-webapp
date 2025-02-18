-- Add last_edited_by column to posts table
ALTER TABLE posts 
ADD COLUMN last_edited_by uuid REFERENCES auth.users(id);

-- Update existing posts to set last_edited_by to author_id
UPDATE posts 
SET last_edited_by = author_id 
WHERE last_edited_by IS NULL; 