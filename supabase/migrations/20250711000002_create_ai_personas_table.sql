-- Create AI personas table
CREATE TABLE IF NOT EXISTS public.ai_personas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  personality_traits jsonb DEFAULT '{}',
  system_prompt text NOT NULL,
  topics text[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;

-- Admin users can view all personas
CREATE POLICY "Admin users can view all personas" ON public.ai_personas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin users can create personas
CREATE POLICY "Admin users can create personas" ON public.ai_personas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin users can update personas
CREATE POLICY "Admin users can update personas" ON public.ai_personas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin users can delete personas
CREATE POLICY "Admin users can delete personas" ON public.ai_personas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for active personas
CREATE INDEX idx_ai_personas_active ON public.ai_personas(active);

-- Add foreign key constraint to posts table
ALTER TABLE public.posts 
ADD CONSTRAINT fk_posts_ai_persona 
FOREIGN KEY (ai_persona_id) 
REFERENCES public.ai_personas(id) 
ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON TABLE public.ai_personas IS 'AI personas for content generation with different styles and topics';
COMMENT ON COLUMN public.ai_personas.personality_traits IS 'JSON object containing traits like tone, style, expertise level, etc.';
COMMENT ON COLUMN public.ai_personas.system_prompt IS 'Base system prompt that defines the persona behavior';
COMMENT ON COLUMN public.ai_personas.topics IS 'Array of topics this persona specializes in';