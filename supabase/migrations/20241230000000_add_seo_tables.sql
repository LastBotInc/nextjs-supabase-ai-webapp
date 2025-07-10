-- SEO Integration Database Schema
-- This migration creates all tables needed for DataForSEO integration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SEO Projects table
CREATE TABLE seo_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SERP Tracking table
CREATE TABLE serp_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,
  location_code INTEGER,
  language_code VARCHAR(10),
  search_engine VARCHAR(50) DEFAULT 'google',
  current_position INTEGER,
  previous_position INTEGER,
  url TEXT,
  title TEXT,
  description TEXT,
  serp_features JSONB DEFAULT '[]',
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keyword Research table
CREATE TABLE keyword_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,
  search_volume INTEGER,
  cpc DECIMAL(10,2),
  competition DECIMAL(3,2),
  difficulty INTEGER,
  search_intent VARCHAR(50),
  related_keywords JSONB DEFAULT '[]',
  trends_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backlink Analysis table
CREATE TABLE backlink_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  referring_domain TEXT,
  referring_url TEXT,
  anchor_text TEXT,
  link_type VARCHAR(50),
  dofollow BOOLEAN,
  first_seen TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  domain_rank INTEGER,
  page_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technical SEO Audits table
CREATE TABLE technical_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status_code INTEGER,
  page_title TEXT,
  meta_description TEXT,
  h1_tags JSONB DEFAULT '[]',
  issues JSONB DEFAULT '[]',
  performance_score INTEGER,
  accessibility_score INTEGER,
  seo_score INTEGER,
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Analysis table
CREATE TABLE content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  content_type VARCHAR(50),
  query TEXT,
  mentions_count INTEGER,
  sentiment_score DECIMAL(3,2),
  sentiment_label VARCHAR(20),
  top_mentions JSONB DEFAULT '[]',
  trends_data JSONB DEFAULT '{}',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DataForSEO API Tasks table (for tracking async operations)
CREATE TABLE dataforseo_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  task_id VARCHAR(255) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- SEO Reports table
CREATE TABLE seo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  report_data JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_seo_projects_user_id ON seo_projects(user_id);
CREATE INDEX idx_seo_projects_domain ON seo_projects(domain);

CREATE INDEX idx_serp_tracking_project_id ON serp_tracking(project_id);
CREATE INDEX idx_serp_tracking_keyword ON serp_tracking(keyword);
CREATE INDEX idx_serp_tracking_tracked_at ON serp_tracking(tracked_at);

CREATE INDEX idx_keyword_research_project_id ON keyword_research(project_id);
CREATE INDEX idx_keyword_research_keyword ON keyword_research(keyword);

CREATE INDEX idx_backlink_analysis_project_id ON backlink_analysis(project_id);
CREATE INDEX idx_backlink_analysis_target_url ON backlink_analysis(target_url);

CREATE INDEX idx_technical_audits_project_id ON technical_audits(project_id);
CREATE INDEX idx_technical_audits_url ON technical_audits(url);
CREATE INDEX idx_technical_audits_audit_date ON technical_audits(audit_date);

CREATE INDEX idx_content_analysis_project_id ON content_analysis(project_id);
CREATE INDEX idx_content_analysis_analyzed_at ON content_analysis(analyzed_at);

CREATE INDEX idx_dataforseo_tasks_project_id ON dataforseo_tasks(project_id);
CREATE INDEX idx_dataforseo_tasks_task_id ON dataforseo_tasks(task_id);
CREATE INDEX idx_dataforseo_tasks_status ON dataforseo_tasks(status);

CREATE INDEX idx_seo_reports_project_id ON seo_reports(project_id);
CREATE INDEX idx_seo_reports_type ON seo_reports(report_type);

-- Row Level Security (RLS) policies
ALTER TABLE seo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlink_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataforseo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_projects
CREATE POLICY "Users can view their own SEO projects" ON seo_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SEO projects" ON seo_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO projects" ON seo_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEO projects" ON seo_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for related tables (using project ownership)
CREATE POLICY "Users can view SERP tracking for their projects" ON serp_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = serp_tracking.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert SERP tracking for their projects" ON serp_tracking
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = serp_tracking.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update SERP tracking for their projects" ON serp_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = serp_tracking.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete SERP tracking for their projects" ON serp_tracking
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = serp_tracking.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Similar policies for other tables (keyword_research)
CREATE POLICY "Users can manage keyword research for their projects" ON keyword_research
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = keyword_research.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Similar policies for backlink_analysis
CREATE POLICY "Users can manage backlink analysis for their projects" ON backlink_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = backlink_analysis.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Similar policies for technical_audits
CREATE POLICY "Users can manage technical audits for their projects" ON technical_audits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = technical_audits.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Similar policies for content_analysis
CREATE POLICY "Users can manage content analysis for their projects" ON content_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = content_analysis.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Similar policies for dataforseo_tasks
CREATE POLICY "Users can manage DataForSEO tasks for their projects" ON dataforseo_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = dataforseo_tasks.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Similar policies for seo_reports
CREATE POLICY "Users can manage SEO reports for their projects" ON seo_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM seo_projects 
      WHERE seo_projects.id = seo_reports.project_id 
      AND seo_projects.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to seo_projects
CREATE TRIGGER update_seo_projects_updated_at 
  BEFORE UPDATE ON seo_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 