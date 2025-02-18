-- Create analytics tables if they don't exist
create table if not exists public.analytics_sessions (
  id uuid primary key,
  first_page text not null,
  user_id uuid,
  user_agent text,
  referrer text,
  device_type text,
  country text,
  city text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.analytics_events (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_type text not null,
  page_url text not null,
  session_id uuid references public.analytics_sessions(id),
  user_id uuid,
  locale text not null default 'en',
  referrer text,
  user_agent text,
  ip_address text,
  device_type text,
  country text,
  city text,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

-- Grant permissions to the service role and anon role
grant all privileges on table public.analytics_sessions to service_role;
grant all privileges on table public.analytics_events to service_role;
grant insert, select on table public.analytics_sessions to anon;
grant insert, select on table public.analytics_events to anon;

-- Create policies for analytics_sessions
create policy "Enable insert for all users" on public.analytics_sessions
  for insert with check (true);

create policy "Enable select for all users" on public.analytics_sessions
  for select using (true);

create policy "Enable update for all users" on public.analytics_sessions
  for update using (true);

-- Create policies for analytics_events
create policy "Enable insert for all users" on public.analytics_events
  for insert with check (true);

create policy "Enable select for all users" on public.analytics_events
  for select using (true);

-- Create function to update session last_seen_at
create or replace function update_session_last_seen()
returns trigger as $$
begin
  update analytics_sessions
  set last_seen_at = NEW.created_at
  where id = NEW.session_id;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger to update session last_seen_at
drop trigger if exists update_session_last_seen_trigger on analytics_events;
create trigger update_session_last_seen_trigger
after insert on analytics_events
for each row
execute function update_session_last_seen();

-- Create indexes for better performance
create index if not exists analytics_sessions_created_at_idx on public.analytics_sessions(created_at);
create index if not exists analytics_sessions_last_seen_at_idx on public.analytics_sessions(last_seen_at);
create index if not exists analytics_sessions_user_id_idx on public.analytics_sessions(user_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at);
create index if not exists analytics_events_session_id_idx on public.analytics_events(session_id);
create index if not exists analytics_events_event_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id); 