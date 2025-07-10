-- Enhanced Analytics Schema Migration
-- This migration adds new columns and capabilities for advanced analytics tracking

-- Add new columns to analytics_events table
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS event_category text,
ADD COLUMN IF NOT EXISTS event_action text,
ADD COLUMN IF NOT EXISTS event_label text,
ADD COLUMN IF NOT EXISTS page_title text,
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS scroll_depth integer,
ADD COLUMN IF NOT EXISTS time_on_page integer, -- in seconds
ADD COLUMN IF NOT EXISTS is_bounce boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS page_load_time integer, -- in milliseconds
ADD COLUMN IF NOT EXISTS connection_type text,
ADD COLUMN IF NOT EXISTS custom_dimensions jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_metrics jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS revenue decimal(10,2),
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;

-- Add new columns to analytics_sessions table
ALTER TABLE public.analytics_sessions
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS session_duration integer, -- in seconds
ADD COLUMN IF NOT EXISTS page_views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_engaged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS engagement_score decimal(5,2) DEFAULT 0.0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON public.analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_action ON public.analytics_events(event_action);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at_desc ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_created_at ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id_created_at ON public.analytics_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON public.analytics_events(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device_type ON public.analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON public.analytics_events(country);
CREATE INDEX IF NOT EXISTS idx_analytics_events_revenue ON public.analytics_events(revenue) WHERE revenue IS NOT NULL;

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id_created_at ON public.analytics_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen_at_desc ON public.analytics_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_is_engaged ON public.analytics_sessions(is_engaged);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_engagement_score ON public.analytics_sessions(engagement_score DESC);

-- Create a view for real-time analytics (last 30 minutes)
CREATE OR REPLACE VIEW public.analytics_realtime AS
SELECT 
  ae.event_type,
  ae.page_url,
  ae.page_title,
  ae.country,
  ae.city,
  ae.device_type,
  ae.browser,
  ae.os,
  ae.created_at,
  ae.user_id,
  ae.session_id,
  ae.referrer,
  ae.custom_dimensions,
  ae.revenue,
  ae.currency
FROM public.analytics_events ae
WHERE ae.created_at >= NOW() - INTERVAL '30 minutes'
ORDER BY ae.created_at DESC;

-- Create a view for active sessions (last 30 minutes)
CREATE OR REPLACE VIEW public.analytics_active_sessions AS
SELECT 
  s.id,
  s.user_id,
  s.first_page,
  s.country,
  s.city,
  s.device_type,
  s.browser,
  s.os,
  s.page_views,
  s.is_engaged,
  s.engagement_score,
  s.session_duration,
  s.last_seen_at,
  COUNT(ae.id) as current_events
FROM public.analytics_sessions s
LEFT JOIN public.analytics_events ae ON s.id = ae.session_id 
  AND ae.created_at >= NOW() - INTERVAL '30 minutes'
WHERE s.last_seen_at >= NOW() - INTERVAL '30 minutes'
GROUP BY s.id, s.user_id, s.first_page, s.country, s.city, s.device_type, 
         s.browser, s.os, s.page_views, s.is_engaged, s.engagement_score, 
         s.session_duration, s.last_seen_at
ORDER BY s.last_seen_at DESC;

-- Create a materialized view for hourly analytics aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS public.analytics_hourly_stats AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  event_type,
  page_url,
  country,
  device_type,
  browser,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(time_on_page) as avg_time_on_page,
  AVG(scroll_depth) as avg_scroll_depth,
  SUM(revenue) as total_revenue,
  COUNT(*) FILTER (WHERE revenue IS NOT NULL) as conversion_count
FROM public.analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), event_type, page_url, country, device_type, browser
ORDER BY hour DESC;

-- Create index for the materialized view
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_stats_hour ON public.analytics_hourly_stats(hour DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_stats_event_type ON public.analytics_hourly_stats(event_type);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_hourly_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.analytics_hourly_stats;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  p_session_duration integer,
  p_page_views integer,
  p_scroll_depth integer,
  p_time_on_page integer,
  p_has_conversion boolean DEFAULT false
)
RETURNS decimal(5,2) AS $$
DECLARE
  score decimal(5,2) := 0.0;
BEGIN
  -- Base score from session duration (max 30 points)
  score := score + LEAST(p_session_duration / 10.0, 30.0);
  
  -- Page views score (max 25 points)
  score := score + LEAST(p_page_views * 3.0, 25.0);
  
  -- Scroll depth score (max 20 points)
  IF p_scroll_depth IS NOT NULL THEN
    score := score + (p_scroll_depth / 100.0) * 20.0;
  END IF;
  
  -- Time on page score (max 15 points)
  IF p_time_on_page IS NOT NULL THEN
    score := score + LEAST(p_time_on_page / 20.0, 15.0);
  END IF;
  
  -- Conversion bonus (10 points)
  IF p_has_conversion THEN
    score := score + 10.0;
  END IF;
  
  RETURN LEAST(score, 100.0);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to update session stats
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session page views and engagement
  UPDATE public.analytics_sessions 
  SET 
    page_views = (
      SELECT COUNT(*) 
      FROM public.analytics_events 
      WHERE session_id = NEW.session_id AND event_type = 'page_view'
    ),
    last_seen_at = NEW.created_at,
    session_duration = EXTRACT(EPOCH FROM (NEW.created_at - created_at))::integer,
    is_engaged = (
      SELECT COUNT(*) 
      FROM public.analytics_events 
      WHERE session_id = NEW.session_id AND event_type = 'page_view'
    ) > 1 
    OR EXTRACT(EPOCH FROM (NEW.created_at - created_at)) > 10
    OR EXISTS (
      SELECT 1 
      FROM public.analytics_events 
      WHERE session_id = NEW.session_id AND revenue IS NOT NULL
    )
  WHERE id = NEW.session_id;
  
  -- Update engagement score
  UPDATE public.analytics_sessions 
  SET engagement_score = calculate_engagement_score(
    session_duration,
    page_views,
    (SELECT AVG(scroll_depth) FROM public.analytics_events WHERE session_id = NEW.session_id)::integer,
    (SELECT AVG(time_on_page) FROM public.analytics_events WHERE session_id = NEW.session_id)::integer,
    EXISTS (SELECT 1 FROM public.analytics_events WHERE session_id = NEW.session_id AND revenue IS NOT NULL)
  )
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_session_stats ON public.analytics_events;
CREATE TRIGGER trigger_update_session_stats
  AFTER INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_session_stats();

-- Grant permissions for views
GRANT SELECT ON public.analytics_realtime TO anon, authenticated;
GRANT SELECT ON public.analytics_active_sessions TO anon, authenticated;
GRANT SELECT ON public.analytics_hourly_stats TO anon, authenticated;

-- Comment the tables and columns
COMMENT ON COLUMN public.analytics_events.event_category IS 'Category of the event (e.g., engagement, conversion, navigation)';
COMMENT ON COLUMN public.analytics_events.event_action IS 'Action performed (e.g., click, submit, scroll)';
COMMENT ON COLUMN public.analytics_events.event_label IS 'Optional label for additional context';
COMMENT ON COLUMN public.analytics_events.scroll_depth IS 'Percentage of page scrolled (0-100)';
COMMENT ON COLUMN public.analytics_events.time_on_page IS 'Time spent on page in seconds';
COMMENT ON COLUMN public.analytics_events.page_load_time IS 'Page load time in milliseconds';
COMMENT ON COLUMN public.analytics_events.custom_dimensions IS 'Custom dimensions as key-value pairs';
COMMENT ON COLUMN public.analytics_events.custom_metrics IS 'Custom metrics as key-value pairs';
COMMENT ON COLUMN public.analytics_events.revenue IS 'Revenue generated from this event';
COMMENT ON COLUMN public.analytics_events.items IS 'E-commerce items associated with this event';

COMMENT ON VIEW public.analytics_realtime IS 'Real-time analytics data for the last 30 minutes';
COMMENT ON VIEW public.analytics_active_sessions IS 'Active user sessions in the last 30 minutes';
COMMENT ON MATERIALIZED VIEW public.analytics_hourly_stats IS 'Hourly aggregated analytics statistics'; 