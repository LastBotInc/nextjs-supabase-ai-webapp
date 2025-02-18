-- Create comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  content text not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade
);

-- Enable RLS
alter table public.comments enable row level security;

-- Create policies
create policy "Anyone can view comments"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update their own comments"
  on public.comments for update
  to authenticated
  using (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = author_id);

-- Create trigger for updated_at
create trigger handle_updated_at before update on public.comments
  for each row execute procedure public.handle_updated_at();

-- Create view for comments with author information
create or replace view public.comment_details as
  select 
    c.id,
    c.created_at,
    c.content,
    c.post_id,
    c.author_id,
    p.username as author_username,
    p.avatar_url as author_avatar_url
  from public.comments c
  join public.profiles p on c.author_id = p.id;

-- Enable security invoker on the view
alter view public.comment_details set (security_invoker = true); 