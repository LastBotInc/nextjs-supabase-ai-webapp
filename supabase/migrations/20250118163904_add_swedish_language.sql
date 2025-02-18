-- Add Swedish language
INSERT INTO languages (code, name, native_name, enabled, created_at, updated_at)
VALUES ('sv', 'Swedish', 'Svenska', true, NOW(), NOW())
ON CONFLICT (code) 
DO UPDATE SET 
  enabled = true,
  native_name = 'Svenska',
  updated_at = NOW();
