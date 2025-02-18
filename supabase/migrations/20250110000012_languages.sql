-- Drop existing objects
drop function if exists public.get_enabled_languages();
drop view if exists public.enabled_languages;
drop table if exists public.languages;

-- Create languages table
create table public.languages (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  code text not null unique,
  name text not null,
  native_name text not null,
  enabled boolean default true not null,
  last_edited_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.languages enable row level security;

-- Create policies with simple auth checks
create policy "Languages are viewable by everyone."
  on public.languages for select
  using ( true );

create policy "Authenticated users can insert languages."
  on public.languages for insert
  to authenticated
  with check ( true );

create policy "Authenticated users can update languages."
  on public.languages for update
  to authenticated
  using ( true );

create policy "Authenticated users can delete languages."
  on public.languages for delete
  to authenticated
  using ( true );

-- Create updated_at trigger
create trigger handle_languages_updated_at
  before update on public.languages
  for each row execute procedure public.handle_updated_at();

-- Insert default languages with ON CONFLICT DO UPDATE to handle existing entries
insert into public.languages (code, name, native_name)
values 
  ('en', 'English', 'English'),
  ('fi', 'Finnish', 'Suomi')
on conflict (code) 
do update set 
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  enabled = true;

-- Create function to get enabled languages
create function public.get_enabled_languages()
returns table (
  code text,
  name text,
  native_name text,
  enabled boolean
)
language sql
security definer
stable
as $$
  select 
    code,
    name,
    native_name,
    enabled
  from public.languages
  where enabled = true
  order by name;
$$;

-- Create function to delete language translations atomically
create or replace function public.delete_language_translations(lang_code text)
returns void
language plpgsql
security definer
as $$
begin
  delete from translations where locale = lang_code;
end;
$$;

-- Grant permissions
grant execute on function public.get_enabled_languages() to anon;
grant execute on function public.get_enabled_languages() to authenticated;
grant execute on function public.delete_language_translations(text) to authenticated;
grant select on public.languages to anon;
grant select, insert, update on public.languages to authenticated; 