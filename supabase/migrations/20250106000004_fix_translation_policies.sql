-- Drop existing policies
drop policy if exists "Service role can manage translations." on translations;
drop policy if exists "Only authenticated users can insert translations." on translations;
drop policy if exists "Only authenticated users can update translations." on translations;

-- Create new policies that work with both service role and authenticated users
create policy "Service role and authenticated users can insert translations."
  on translations for insert
  with check (
    auth.jwt() is null -- service role
    or auth.role() = 'authenticated' -- authenticated users
  );

create policy "Service role and authenticated users can update translations."
  on translations for update
  using (
    auth.jwt() is null -- service role
    or auth.role() = 'authenticated' -- authenticated users
  );

create policy "Service role and authenticated users can delete translations."
  on translations for delete
  using (
    auth.jwt() is null -- service role
    or auth.role() = 'authenticated' -- authenticated users
  ); 