-- Drop the existing overly broad admin policy
DROP POLICY IF EXISTS "Admins have full access to landing pages" ON public.landing_pages;

-- Recreate or ensure the public select policy exists (might be implicitly handled by Supabase UI, but good practice to define)
-- Drop it first in case it exists from previous attempts with different definitions
DROP POLICY IF EXISTS "Public can view published landing pages" ON public.landing_pages;
CREATE POLICY "Public can view published landing pages" ON public.landing_pages
FOR SELECT
TO anon, authenticated -- Explicitly grant to anon and authenticated roles
USING ( published = true );

-- Create a specific SELECT policy for admins (only for authenticated users)
DROP POLICY IF EXISTS "Admin SELECT access for landing pages" ON public.landing_pages;
CREATE POLICY "Admin SELECT access for landing pages" ON public.landing_pages
FOR SELECT
TO authenticated -- Change from public to authenticated
USING (
  (SELECT auth.uid()) IN (
    SELECT users.id
    FROM auth.users
    WHERE (users.raw_user_meta_data ->> 'role'::text) = 'admin'::text
  )
);

-- Create a specific INSERT/UPDATE/DELETE policy for admins (only for authenticated users)
DROP POLICY IF EXISTS "Admin WRITE access for landing pages" ON public.landing_pages;
CREATE POLICY "Admin WRITE access for landing pages" ON public.landing_pages
FOR ALL -- Applies to INSERT, UPDATE, DELETE implicitly when SELECT is separate
TO authenticated -- Change from public to authenticated
USING (
  (SELECT auth.uid()) IN (
    SELECT users.id
    FROM auth.users
    WHERE (users.raw_user_meta_data ->> 'role'::text) = 'admin'::text
  )
)
WITH CHECK (
  (SELECT auth.uid()) IN (
    SELECT users.id
    FROM auth.users
    WHERE (users.raw_user_meta_data ->> 'role'::text) = 'admin'::text
  )
);
