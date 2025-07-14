-- Create brands table for managing multiple company brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic brand information
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  description TEXT,
  
  -- Brand tone (0-10 scale)
  tone_formal INTEGER DEFAULT 5 CHECK (tone_formal >= 0 AND tone_formal <= 10),
  tone_friendly INTEGER DEFAULT 5 CHECK (tone_friendly >= 0 AND tone_friendly <= 10),
  tone_technical INTEGER DEFAULT 5 CHECK (tone_technical >= 0 AND tone_technical <= 10),
  tone_innovative INTEGER DEFAULT 5 CHECK (tone_innovative >= 0 AND tone_innovative <= 10),
  
  -- Brand personality
  personality_primary TEXT[] DEFAULT ARRAY[]::TEXT[],
  personality_secondary TEXT[] DEFAULT ARRAY[]::TEXT[],
  personality_avoid TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Writing style and phrases
  writing_style TEXT[] DEFAULT ARRAY[]::TEXT[],
  common_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoid_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Services and solutions (JSON for flexibility)
  services JSONB DEFAULT '[]'::JSONB,
  solutions JSONB DEFAULT '[]'::JSONB,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, name)
);

-- Create index for faster lookups
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own brands
CREATE POLICY "Users can view own brands" ON brands
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own brands
CREATE POLICY "Users can create own brands" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own brands
CREATE POLICY "Users can update own brands" ON brands
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own brands
CREATE POLICY "Users can delete own brands" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- Admin users can view all brands
CREATE POLICY "Admins can view all brands" ON brands
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
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

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();