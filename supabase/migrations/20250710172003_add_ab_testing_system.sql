-- A/B Testing System Database Schema
-- This creates a comprehensive A/B testing framework

-- Experiments table: defines A/B tests
CREATE TABLE ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'archived')),
  
  -- Configuration
  traffic_allocation DECIMAL(5,2) NOT NULL DEFAULT 100.00 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Targeting
  target_pages TEXT[], -- Array of page paths to include
  target_audiences JSONB DEFAULT '{}', -- Audience targeting criteria
  exclude_audiences JSONB DEFAULT '{}', -- Audience exclusion criteria
  
  -- Goals and metrics
  primary_goal TEXT, -- Main conversion goal
  secondary_goals TEXT[], -- Additional goals to track
  minimum_sample_size INTEGER DEFAULT 1000,
  confidence_level DECIMAL(4,2) DEFAULT 95.00,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date < end_date)
);

-- Experiment variants table: defines different versions being tested
CREATE TABLE ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'Control', 'Variant A', 'Variant B'
  description TEXT,
  is_control BOOLEAN DEFAULT FALSE,
  
  -- Traffic allocation for this variant (percentage)
  traffic_weight INTEGER NOT NULL DEFAULT 50 CHECK (traffic_weight >= 0 AND traffic_weight <= 100),
  
  -- Variant configuration
  config JSONB NOT NULL DEFAULT '{}', -- Stores variant-specific settings
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(experiment_id, name)
);

-- User assignments table: tracks which users see which variants
CREATE TABLE ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_variants(id) ON DELETE CASCADE,
  
  -- User identification
  user_id UUID REFERENCES profiles(id), -- For authenticated users
  session_id TEXT, -- For anonymous users
  fingerprint TEXT, -- Browser fingerprint for consistency
  
  -- Assignment metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  first_exposure_at TIMESTAMPTZ,
  last_exposure_at TIMESTAMPTZ,
  exposure_count INTEGER DEFAULT 0,
  
  -- User context at assignment
  user_agent TEXT,
  country TEXT,
  region TEXT,
  language TEXT,
  referrer TEXT,
  
  UNIQUE(experiment_id, user_id),
  UNIQUE(experiment_id, session_id),
  CONSTRAINT user_or_session_required CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Experiment events table: tracks user interactions and conversions
CREATE TABLE ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_variants(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES ab_assignments(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'exposure', 'conversion', 'custom'
  event_name TEXT, -- Specific event name (e.g., 'button_click', 'purchase')
  event_value DECIMAL(10,2), -- Numeric value (e.g., revenue, time spent)
  event_properties JSONB DEFAULT '{}', -- Additional event data
  
  -- Context
  page_url TEXT,
  page_title TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- User context
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  
  -- Analytics integration
  analytics_event_id UUID REFERENCES analytics_events(id)
);

-- Experiment results materialized view for performance
CREATE MATERIALIZED VIEW ab_experiment_results AS
SELECT 
  e.id as experiment_id,
  e.name as experiment_name,
  e.status,
  v.id as variant_id,
  v.name as variant_name,
  v.is_control,
  
  -- Assignment metrics
  COUNT(DISTINCT a.id) as total_assignments,
  COUNT(DISTINCT CASE WHEN a.first_exposure_at IS NOT NULL THEN a.id END) as exposed_users,
  
  -- Conversion metrics
  COUNT(DISTINCT CASE WHEN ev.event_type = 'conversion' THEN a.id END) as conversions,
  COUNT(DISTINCT CASE WHEN ev.event_type = 'conversion' AND ev.event_name = e.primary_goal THEN a.id END) as primary_conversions,
  
  -- Calculated rates
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN a.first_exposure_at IS NOT NULL THEN a.id END) > 0 
    THEN (COUNT(DISTINCT CASE WHEN ev.event_type = 'conversion' AND ev.event_name = e.primary_goal THEN a.id END)::DECIMAL / 
          COUNT(DISTINCT CASE WHEN a.first_exposure_at IS NOT NULL THEN a.id END)) * 100
    ELSE 0 
  END as conversion_rate,
  
  -- Revenue metrics
  SUM(CASE WHEN ev.event_type = 'conversion' THEN COALESCE(ev.event_value, 0) ELSE 0 END) as total_revenue,
  AVG(CASE WHEN ev.event_type = 'conversion' AND ev.event_value > 0 THEN ev.event_value END) as avg_order_value,
  
  -- Time metrics
  MIN(a.assigned_at) as first_assignment,
  MAX(a.assigned_at) as last_assignment,
  
  -- Update timestamp
  NOW() as calculated_at
  
FROM ab_experiments e
LEFT JOIN ab_variants v ON e.id = v.experiment_id
LEFT JOIN ab_assignments a ON v.id = a.variant_id
LEFT JOIN ab_events ev ON a.id = ev.assignment_id
WHERE e.status IN ('running', 'completed')
GROUP BY e.id, e.name, e.status, v.id, v.name, v.is_control, e.primary_goal;

-- Statistical significance calculation function
CREATE OR REPLACE FUNCTION calculate_statistical_significance(
  control_conversions INTEGER,
  control_exposures INTEGER,
  variant_conversions INTEGER,
  variant_exposures INTEGER,
  confidence_level DECIMAL DEFAULT 95.0
) RETURNS JSONB AS $$
DECLARE
  control_rate DECIMAL;
  variant_rate DECIMAL;
  pooled_rate DECIMAL;
  standard_error DECIMAL;
  z_score DECIMAL;
  p_value DECIMAL;
  is_significant BOOLEAN;
  improvement DECIMAL;
  z_critical DECIMAL;
BEGIN
  -- Handle edge cases
  IF control_exposures = 0 OR variant_exposures = 0 THEN
    RETURN jsonb_build_object(
      'is_significant', false,
      'p_value', null,
      'improvement', null,
      'error', 'Insufficient data'
    );
  END IF;
  
  -- Calculate conversion rates
  control_rate := control_conversions::DECIMAL / control_exposures;
  variant_rate := variant_conversions::DECIMAL / variant_exposures;
  
  -- Calculate improvement
  improvement := CASE 
    WHEN control_rate > 0 THEN ((variant_rate - control_rate) / control_rate) * 100
    ELSE NULL
  END;
  
  -- Calculate pooled rate and standard error
  pooled_rate := (control_conversions + variant_conversions)::DECIMAL / (control_exposures + variant_exposures);
  standard_error := SQRT(pooled_rate * (1 - pooled_rate) * (1.0/control_exposures + 1.0/variant_exposures));
  
  -- Calculate z-score
  IF standard_error > 0 THEN
    z_score := (variant_rate - control_rate) / standard_error;
  ELSE
    z_score := 0;
  END IF;
  
  -- Determine significance (two-tailed test)
  z_critical := CASE 
    WHEN confidence_level = 90.0 THEN 1.645
    WHEN confidence_level = 95.0 THEN 1.96
    WHEN confidence_level = 99.0 THEN 2.576
    ELSE 1.96
  END;
  
  is_significant := ABS(z_score) >= z_critical;
  
  -- Approximate p-value calculation (simplified)
  p_value := 2 * (1 - (0.5 * (1 + SIGN(ABS(z_score)) * SQRT(1 - EXP(-2 * ABS(z_score) * ABS(z_score) / 3.14159)))));
  
  RETURN jsonb_build_object(
    'control_rate', ROUND(control_rate * 100, 2),
    'variant_rate', ROUND(variant_rate * 100, 2),
    'improvement', ROUND(improvement, 2),
    'z_score', ROUND(z_score, 4),
    'p_value', ROUND(p_value, 4),
    'is_significant', is_significant,
    'confidence_level', confidence_level
  );
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_ab_experiments_status ON ab_experiments(status);
CREATE INDEX idx_ab_experiments_dates ON ab_experiments(start_date, end_date);
CREATE INDEX idx_ab_variants_experiment ON ab_variants(experiment_id);
CREATE INDEX idx_ab_assignments_experiment ON ab_assignments(experiment_id);
CREATE INDEX idx_ab_assignments_user ON ab_assignments(user_id);
CREATE INDEX idx_ab_assignments_session ON ab_assignments(session_id);
CREATE INDEX idx_ab_events_experiment ON ab_events(experiment_id);
CREATE INDEX idx_ab_events_variant ON ab_events(variant_id);
CREATE INDEX idx_ab_events_assignment ON ab_events(assignment_id);
CREATE INDEX idx_ab_events_type_name ON ab_events(event_type, event_name);
CREATE INDEX idx_ab_events_timestamp ON ab_events(timestamp);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ab_experiments_updated_at
  BEFORE UPDATE ON ab_experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_variants_updated_at
  BEFORE UPDATE ON ab_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Experiments: Admin access only
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage experiments" ON ab_experiments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Variants: Admin access only
ALTER TABLE ab_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage variants" ON ab_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Assignments: Public read for active experiments, admin write
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view assignments for active experiments" ON ab_assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ab_experiments 
    WHERE id = experiment_id AND status = 'running'
  )
);
CREATE POLICY "Public can create assignments" ON ab_assignments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM ab_experiments 
    WHERE id = experiment_id AND status = 'running'
  )
);
CREATE POLICY "Admins can manage all assignments" ON ab_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Events: Public create, admin read
ALTER TABLE ab_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create events" ON ab_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view events" ON ab_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_ab_experiment_results()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW ab_experiment_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial data: Create a sample experiment for testing
INSERT INTO ab_experiments (name, description, hypothesis, status, traffic_allocation, primary_goal)
VALUES (
  'Homepage Hero Button Test',
  'Testing different button colors on the homepage hero section',
  'A green button will have higher conversion rate than the current blue button',
  'draft',
  100.0,
  'hero_button_click'
);

-- Get the experiment ID and create variants
DO $$
DECLARE
  exp_id UUID;
BEGIN
  SELECT id INTO exp_id FROM ab_experiments WHERE name = 'Homepage Hero Button Test';
  
  INSERT INTO ab_variants (experiment_id, name, description, is_control, traffic_weight, config) VALUES
  (exp_id, 'Control (Blue)', 'Original blue button', true, 50, '{"button_color": "blue", "button_text": "Get Started"}'),
  (exp_id, 'Variant A (Green)', 'Green button variant', false, 50, '{"button_color": "green", "button_text": "Get Started"}');
END $$;
