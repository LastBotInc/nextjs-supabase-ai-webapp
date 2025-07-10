-- Fix RLS policies for A/B testing tables to work with service role authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage experiments" ON ab_experiments;
DROP POLICY IF EXISTS "Admins can manage variants" ON ab_variants;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON ab_assignments;
DROP POLICY IF EXISTS "Admins can view events" ON ab_events;

-- Create updated policies that work with service role authentication

-- Experiments: Allow service role and admin users
CREATE POLICY "Service role and admins can manage experiments" ON ab_experiments FOR ALL USING (
  -- Allow service role (bypasses RLS)
  auth.role() = 'service_role' OR
  -- Allow authenticated admin users
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ))
);

-- Variants: Allow service role and admin users
CREATE POLICY "Service role and admins can manage variants" ON ab_variants FOR ALL USING (
  -- Allow service role (bypasses RLS)
  auth.role() = 'service_role' OR
  -- Allow authenticated admin users
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ))
);

-- Assignments: Keep existing public policies, add service role
CREATE POLICY "Service role and admins can manage all assignments" ON ab_assignments FOR ALL USING (
  -- Allow service role (bypasses RLS)
  auth.role() = 'service_role' OR
  -- Allow authenticated admin users
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ))
);

-- Events: Allow service role and admin users to view
CREATE POLICY "Service role and admins can view events" ON ab_events FOR SELECT USING (
  -- Allow service role (bypasses RLS)
  auth.role() = 'service_role' OR
  -- Allow authenticated admin users
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ))
);

-- Grant necessary permissions to service role
GRANT ALL ON ab_experiments TO service_role;
GRANT ALL ON ab_variants TO service_role;
GRANT ALL ON ab_assignments TO service_role;
GRANT ALL ON ab_events TO service_role;
GRANT ALL ON ab_experiment_results TO service_role;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION calculate_statistical_significance TO service_role;
GRANT EXECUTE ON FUNCTION refresh_ab_experiment_results TO service_role;
