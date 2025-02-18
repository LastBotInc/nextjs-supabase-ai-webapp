-- Add new columns to profiles table
alter table profiles 
add column if not exists company text,
add column if not exists is_admin boolean default false,
add column if not exists newsletter_subscription boolean default false,
add column if not exists marketing_consent boolean default false,
add column if not exists email text;

-- Update email from auth.users
update profiles
set email = au.email
from auth.users au
where profiles.id = au.id;

-- Make email non-nullable and unique
alter table profiles 
alter column email set not null,
add constraint profiles_email_key unique (email);

-- Create admin access policies
create policy "Only admins can view all profiles"
  on profiles for select
  using ( auth.jwt() ->> 'is_admin' = 'true' );

create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Update handle_new_user function to include new fields
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    username, 
    full_name, 
    email,
    company,
    is_admin,
    newsletter_subscription,
    marketing_consent
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'company',
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false),
    (new.raw_user_meta_data->>'newsletter_subscription')::boolean,
    (new.raw_user_meta_data->>'marketing_consent')::boolean
  );
  return new;
end;
$$; 