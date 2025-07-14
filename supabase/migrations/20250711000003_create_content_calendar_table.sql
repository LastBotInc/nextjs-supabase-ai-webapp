-- Create content calendar table
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  time_slot time DEFAULT '09:00:00',
  persona_id uuid REFERENCES public.ai_personas(id) ON DELETE CASCADE,
  topic text NOT NULL,
  keywords text[],
  target_audience text,
  content_type text DEFAULT 'blog' CHECK (content_type IN ('blog', 'social', 'email', 'landing')),
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'generating', 'generated', 'scheduled', 'published', 'failed')),
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  locale text NOT NULL DEFAULT 'en',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create unique constraint for date + time_slot + locale
CREATE UNIQUE INDEX idx_content_calendar_unique_slot 
ON public.content_calendar(date, time_slot, locale);

-- Add RLS policies
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

-- Admin users can view all calendar entries
CREATE POLICY "Admin users can view calendar" ON public.content_calendar
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin users can create calendar entries
CREATE POLICY "Admin users can create calendar entries" ON public.content_calendar
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin users can update calendar entries
CREATE POLICY "Admin users can update calendar entries" ON public.content_calendar
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin users can delete calendar entries
CREATE POLICY "Admin users can delete calendar entries" ON public.content_calendar
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX idx_content_calendar_date ON public.content_calendar(date);
CREATE INDEX idx_content_calendar_status ON public.content_calendar(status);
CREATE INDEX idx_content_calendar_persona ON public.content_calendar(persona_id);

-- Create table for storing persona questions/queries
CREATE TABLE IF NOT EXISTS public.persona_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id uuid NOT NULL REFERENCES public.ai_personas(id) ON DELETE CASCADE,
  query text NOT NULL,
  intent text,
  expected_content_type text,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS for persona_queries
ALTER TABLE public.persona_queries ENABLE ROW LEVEL SECURITY;

-- Admin policies for persona_queries
CREATE POLICY "Admin users can manage persona queries" ON public.persona_queries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add index for persona queries
CREATE INDEX idx_persona_queries_persona ON public.persona_queries(persona_id);

-- Add comments for documentation
COMMENT ON TABLE public.content_calendar IS 'Content publishing calendar with AI-generated content scheduling';
COMMENT ON COLUMN public.content_calendar.time_slot IS 'Time of day for publishing (useful for social media scheduling)';
COMMENT ON COLUMN public.content_calendar.keywords IS 'SEO keywords and phrases to target';
COMMENT ON COLUMN public.content_calendar.target_audience IS 'Description of the target audience for this content';
COMMENT ON TABLE public.persona_queries IS 'Typical questions and queries associated with each AI persona';