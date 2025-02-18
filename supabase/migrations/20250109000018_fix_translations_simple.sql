-- Drop existing functions
drop function if exists get_translations;
drop function if exists get_namespace_translations;

-- Create a simpler function to get translations
create or replace function get_translations(requested_locale text)
returns jsonb
language sql
security definer
stable
as $$
  with translations_by_namespace as (
    select 
      namespace,
      jsonb_object_agg(key, value) as translations
    from translations
    where locale = requested_locale
    group by namespace
  )
  select coalesce(
    jsonb_object_agg(namespace, translations),
    '{}'::jsonb
  )
  from translations_by_namespace;
$$;

-- Grant execute permissions
grant execute on function get_translations to anon, authenticated;

-- Grant select permissions on translations table
grant select on translations to anon, authenticated; 