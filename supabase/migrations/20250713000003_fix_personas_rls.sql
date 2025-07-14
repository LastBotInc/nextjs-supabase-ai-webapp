-- Add policy to allow authenticated users to read active personas
CREATE POLICY "Authenticated users can view active personas" ON public.ai_personas
  FOR SELECT
  USING (
    active = true 
    AND auth.role() = 'authenticated'
  );

-- Comment to explain the policy
COMMENT ON POLICY "Authenticated users can view active personas" ON public.ai_personas 
IS 'Allows any authenticated user to read active personas for content generation';