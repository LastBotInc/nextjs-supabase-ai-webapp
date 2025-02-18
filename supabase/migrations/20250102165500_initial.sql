-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique not null,
  full_name text not null,
  avatar_url text,
  website text,
  bio text,
  constraint username_length check (char_length(username) >= 3)
);

-- Create posts table
create table posts (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null,
  content text not null,
  excerpt text,
  published boolean default false not null,
  author_id uuid references profiles(id) on delete cascade not null,
  locale text not null,
  featured_image text,
  meta_description text,
  tags text[] default '{}'::text[],
  constraint slug_length check (char_length(slug) >= 3),
  constraint title_length check (char_length(title) >= 3),
  constraint content_length check (char_length(content) >= 10)
);

-- Create unique constraint for slug per locale
create unique index posts_slug_locale_key on posts (slug, locale);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table posts enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Published posts are viewable by everyone."
  on posts for select
  using ( published = true );

create policy "Authenticated users can view all posts."
  on posts for select
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can create posts."
  on posts for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update own posts."
  on posts for update
  using ( auth.uid() = author_id );

create policy "Users can delete own posts."
  on posts for delete
  using ( auth.uid() = author_id );

-- Create functions
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger function
create function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_posts_updated_at
  before update on posts
  for each row execute procedure public.handle_updated_at();
