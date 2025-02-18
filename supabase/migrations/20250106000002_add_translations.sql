-- Create translations table
create table if not exists public.translations (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  namespace text not null,
  key text not null,
  locale text not null,
  value text not null,
  is_html boolean default false not null,
  last_edited_by uuid references auth.users(id),
  constraint unique_translation unique (namespace, key, locale)
);

-- Enable RLS
alter table translations enable row level security;

-- Create policies
create policy "Translations are viewable by everyone."
  on translations for select
  using ( true );

create policy "Service role can manage translations."
  on translations
  using ( auth.jwt() is null )
  with check ( auth.jwt() is null );

create policy "Only authenticated users can insert translations."
  on translations for insert
  with check ( auth.role() = 'authenticated' );

create policy "Only authenticated users can update translations."
  on translations for update
  using ( auth.role() = 'authenticated' );

-- Create updated_at trigger
create trigger handle_translations_updated_at
  before update on translations
  for each row execute procedure public.handle_updated_at();

-- Drop existing function if it exists
drop function if exists get_translations;

-- Create function to get translations by locale with debug logging
create or replace function get_translations(requested_locale text)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
  debug_info jsonb;
begin
  -- First, get all translations for the requested locale
  with translations_raw as (
    select 
      namespace,
      key,
      value
    from translations
    where locale = requested_locale
  ),
  -- Create the nested structure
  translations_nested as (
    select
      namespace,
      case
        when position('.' in key) > 0 then
          -- For nested keys, create a nested object
          jsonb_build_object(
            split_part(key, '.', 1),
            jsonb_build_object(
              substring(key from position('.' in key) + 1),
              value
            )
          )
        else
          -- For top-level keys, create a simple key-value pair
          jsonb_build_object(key, value)
      end as translation
    from translations_raw
  )
  -- Aggregate translations by namespace
  select jsonb_object_agg(
    namespace,
    jsonb_object_agg(
      key,
      value
    )
  )
  into result
  from (
    select
      namespace,
      key,
      value
    from translations_nested t,
    jsonb_each(t.translation)
  ) expanded;

  -- Create debug info
  select jsonb_build_object(
    'requested_locale', requested_locale,
    'raw_translations', (
      select jsonb_agg(to_jsonb(t))
      from translations t
      where t.locale = requested_locale
    ),
    'result', result
  ) into debug_info;

  -- Log debug info
  raise notice 'get_translations debug: %', debug_info;

  return coalesce(result, '{}'::jsonb);
end;
$$; 