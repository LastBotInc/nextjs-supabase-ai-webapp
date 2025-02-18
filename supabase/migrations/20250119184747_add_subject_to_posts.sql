-- Add subject column to posts table with check constraint
ALTER TABLE posts 
ADD COLUMN subject text DEFAULT 'case-stories' NOT NULL;

-- Add check constraint for valid subjects
ALTER TABLE posts 
ADD CONSTRAINT valid_subject CHECK (subject IN ('news', 'research', 'generative-ai', 'case-stories'));

-- Create index for faster filtering
CREATE INDEX idx_posts_subject ON posts(subject);

-- Update existing posts to have default subject
UPDATE posts SET subject = 'case-stories' WHERE subject IS NULL;
