-- Note: RLS is already enabled by default on storage.objects in Supabase
-- No need to explicitly enable it as it would cause permission errors

-- Create media bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set public = true;

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow authenticated deletes" on storage.objects;
drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Link storage objects with media assets" on storage.objects;

-- Allow authenticated users to upload files
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'media'
    and (
        owner = auth.uid()
        or exists (
            select 1 from media_assets 
            where media_assets.original_url like '%' || name
            and media_assets.user_id = auth.uid()
        )
    )
);

-- Allow authenticated users to delete their own files
create policy "Allow authenticated deletes"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'media' 
    and (
        owner = auth.uid()
        or exists (
            select 1 from media_assets 
            where media_assets.original_url like '%' || name
            and media_assets.user_id = auth.uid()
        )
    )
);

-- Allow public access to read files
create policy "Allow public read access"
on storage.objects for select
to public
using (bucket_id = 'media'); 