-- Add policy to allow authenticated users to create content calendar entries
-- This is needed for the content planning feature
CREATE POLICY "Authenticated users can create calendar entries" ON public.content_calendar
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- Add policy to allow authenticated users to view their own calendar entries
CREATE POLICY "Authenticated users can view own calendar entries" ON public.content_calendar
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- Add policy to allow authenticated users to update their own calendar entries
CREATE POLICY "Authenticated users can update own calendar entries" ON public.content_calendar
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- Comment on new policies
COMMENT ON POLICY "Authenticated users can create calendar entries" ON public.content_calendar 
IS 'Allows authenticated users to create content calendar entries with proper user attribution';

COMMENT ON POLICY "Authenticated users can view own calendar entries" ON public.content_calendar 
IS 'Allows authenticated users to view their own content calendar entries';

COMMENT ON POLICY "Authenticated users can update own calendar entries" ON public.content_calendar 
IS 'Allows authenticated users to update their own content calendar entries';