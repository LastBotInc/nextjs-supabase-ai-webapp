-- Enable Realtime for languages table
alter publication supabase_realtime add table public.languages;

-- Enable row level security
alter table public.languages replica identity full; 