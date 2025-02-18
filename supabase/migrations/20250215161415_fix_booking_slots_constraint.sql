-- Drop the existing unique constraint if it exists
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

-- Add the new unique constraint if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'booking_slots_user_id_start_time_end_time_key'
    ) THEN
        ALTER TABLE booking_slots
        ADD CONSTRAINT booking_slots_user_id_start_time_end_time_key 
        UNIQUE (user_id, start_time, end_time);
    END IF;
END $$;
