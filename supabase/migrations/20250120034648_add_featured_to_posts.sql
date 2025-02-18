-- Add featured column to posts table
ALTER TABLE posts ADD COLUMN featured BOOLEAN DEFAULT false;

-- Create RLS policies if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON "public"."posts"
            FOR SELECT
            USING (published = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" ON "public"."posts"
            FOR INSERT
            WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Enable update for post authors'
    ) THEN
        CREATE POLICY "Enable update for post authors" ON "public"."posts"
            FOR UPDATE
            USING (auth.uid() = author_id)
            WITH CHECK (auth.uid() = author_id);
    END IF;
END $$;
