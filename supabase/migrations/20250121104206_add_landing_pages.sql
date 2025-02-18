-- Create landing_pages table
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_description TEXT,
  featured_image TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  seo_data JSONB DEFAULT '{}'::jsonb,
  analytics_data JSONB DEFAULT '{}'::jsonb,
  template TEXT,
  custom_css TEXT,
  custom_js TEXT,
  custom_head TEXT,
  custom_scripts TEXT[]
);

-- Create RLS policies
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Policy for public access to published pages
CREATE POLICY "Public can view published landing pages"
  ON public.landing_pages
  FOR SELECT
  USING (published = true);

-- Policy for admin access
CREATE POLICY "Admins have full access to landing pages"
  ON public.landing_pages
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX landing_pages_slug_idx ON public.landing_pages (slug);
CREATE INDEX landing_pages_locale_idx ON public.landing_pages (locale);
CREATE INDEX landing_pages_published_idx ON public.landing_pages (published);

-- Create or update sitemap function
CREATE OR REPLACE FUNCTION public.get_sitemap_urls()
RETURNS TABLE (
  url TEXT,
  last_modified TIMESTAMP WITH TIME ZONE,
  change_freq TEXT,
  priority DECIMAL
) AS $$
BEGIN
  -- Return URLs for published landing pages
  RETURN QUERY
  SELECT 
    CONCAT(current_setting('app.site_url'), '/', locale, '/', slug) as url,
    updated_at as last_modified,
    'daily'::TEXT as change_freq,
    0.8 as priority
  FROM public.landing_pages
  WHERE published = true;

  -- Return URLs for published blog posts
  RETURN QUERY
  SELECT 
    CONCAT(current_setting('app.site_url'), '/', locale, '/blog/', slug) as url,
    updated_at as last_modified,
    'weekly'::TEXT as change_freq,
    0.7 as priority
  FROM public.posts
  WHERE published = true;
END;
$$ LANGUAGE plpgsql;
