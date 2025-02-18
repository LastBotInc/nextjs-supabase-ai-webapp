-- Drop existing policies if they exist
drop policy if exists "Anyone can create contacts" on contacts;
drop policy if exists "Only authenticated users can view contacts" on contacts;
drop policy if exists "Only admins can delete contacts" on contacts;
drop policy if exists "Only admins can update contacts" on contacts;

-- Create policies
create policy "Anyone can create contacts"
  on contacts for insert
  with check ( true );

create policy "Only authenticated users can view contacts"
  on contacts for select
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete contacts"
  on contacts for delete
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can update contacts"
  on contacts for update
  using ( auth.role() = 'authenticated' );
