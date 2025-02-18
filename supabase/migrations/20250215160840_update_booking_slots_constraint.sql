-- Only drop the constraint if it exists
DO $$ BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'booking_slots_start_time_user_id_key'
    ) THEN
        ALTER TABLE booking_slots 
        DROP CONSTRAINT booking_slots_start_time_user_id_key;
    END IF;
END $$;

-- Only add the new constraint if the table exists
DO $$ BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_name = 'booking_slots'
    ) THEN
        ALTER TABLE booking_slots
        ADD CONSTRAINT booking_slots_user_id_start_time_end_time_key 
        UNIQUE (user_id, start_time, end_time);
    END IF;
END $$;
