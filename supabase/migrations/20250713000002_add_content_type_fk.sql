-- Add foreign key for content_type_id after content_types table exists
ALTER TABLE content_calendar 
ADD CONSTRAINT fk_content_type 
FOREIGN KEY (content_type_id) 
REFERENCES content_types(id) 
ON DELETE SET NULL;