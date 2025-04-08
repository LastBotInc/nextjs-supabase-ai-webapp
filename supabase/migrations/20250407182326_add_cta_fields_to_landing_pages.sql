ALTER TABLE public.landing_pages
ADD COLUMN cta_headline text,
ADD COLUMN cta_description text,
ADD COLUMN cta_button_text text,
ADD COLUMN cta_button_link text DEFAULT '#',
ADD COLUMN cta_secondary_text text;
