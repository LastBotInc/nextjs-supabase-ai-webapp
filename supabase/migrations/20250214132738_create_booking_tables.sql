-- Create appointment_types table first
CREATE TABLE appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL CHECK (LENGTH(name) >= 2),
    slug TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL CHECK (duration > 0),
    price DECIMAL(10,2),
    is_free BOOLEAN NOT NULL DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(name, user_id),
    UNIQUE(slug, user_id)
);

-- Create booking_settings table
CREATE TABLE booking_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone TEXT NOT NULL,
    default_duration INTEGER NOT NULL CHECK (default_duration > 0),
    buffer_before INTEGER NOT NULL DEFAULT 0 CHECK (buffer_before >= 0),
    buffer_after INTEGER NOT NULL DEFAULT 0 CHECK (buffer_after >= 0),
    available_hours JSONB NOT NULL DEFAULT '[]'::JSONB,
    unavailable_dates TEXT[] DEFAULT ARRAY[]::TEXT[],
    UNIQUE(user_id)
);

-- Create bookings table with appointment_type_id
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name TEXT NOT NULL CHECK (LENGTH(customer_name) >= 2),
    customer_email TEXT NOT NULL CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    customer_company TEXT,
    description TEXT CHECK (description IS NULL OR LENGTH(description) <= 1000),
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    meeting_link TEXT,
    calendar_event_id TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    appointment_type_id UUID REFERENCES appointment_types(id) ON DELETE SET NULL,
    CHECK (end_time > start_time)
);

-- Create booking_slots table
CREATE TABLE booking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    status TEXT NOT NULL CHECK (status IN ('available', 'booked', 'blocked')),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    CHECK (end_time > start_time),
    UNIQUE(start_time, user_id)
);

-- Create booking_slot_groups table to track combined slots
CREATE TABLE booking_slot_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    slot_ids UUID[] NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    CHECK (end_time > start_time)
);

-- Enable RLS on all tables
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slot_groups ENABLE ROW LEVEL SECURITY;

-- Booking Settings Policies
CREATE POLICY "Users can view their own settings"
    ON booking_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON booking_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON booking_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Booking Slots Policies
CREATE POLICY "Anyone can view available slots"
    ON booking_slots FOR SELECT
    USING (status = 'available' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own slots"
    ON booking_slots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slots"
    ON booking_slots FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slots"
    ON booking_slots FOR DELETE
    USING (auth.uid() = user_id);

-- Booking Slot Groups Policies
CREATE POLICY "Anyone can view slot groups"
    ON booking_slot_groups FOR SELECT
    USING (true);

CREATE POLICY "System can manage slot groups"
    ON booking_slot_groups FOR ALL
    USING (true)
    WITH CHECK (true);

-- Bookings Policies
CREATE POLICY "Users can view bookings for their slots"
    ON bookings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can create bookings with valid slots"
    ON bookings FOR INSERT
    WITH CHECK (
        -- Check that all required slots exist and are available
        EXISTS (
            SELECT 1 FROM booking_slots
            WHERE booking_slots.user_id = bookings.user_id
            AND booking_slots.start_time = bookings.start_time
            AND booking_slots.status = 'available'
            AND EXISTS (
                -- Verify appointment type exists and duration matches
                SELECT 1 FROM appointment_types
                WHERE id = bookings.appointment_type_id
                AND is_active = true
                AND duration <= (
                    SELECT COUNT(*) * 15 -- Each slot is 15 minutes
                    FROM booking_slots s
                    WHERE s.user_id = bookings.user_id
                    AND s.start_time >= bookings.start_time
                    AND s.end_time <= bookings.end_time
                    AND s.status = 'available'
                )
            )
        )
    );

CREATE POLICY "Users can update their bookings"
    ON bookings FOR UPDATE
    USING (user_id = auth.uid());

-- Create function to mark slots as booked and create slot group
CREATE OR REPLACE FUNCTION mark_slots_as_booked()
RETURNS TRIGGER AS $$
DECLARE
    slot_ids UUID[];
BEGIN
    -- Get all slot IDs within the booking time range
    WITH slots AS (
        UPDATE booking_slots
        SET status = 'booked',
            booking_id = NEW.id
        WHERE user_id = NEW.user_id
        AND start_time >= NEW.start_time
        AND end_time <= NEW.end_time
        AND status = 'available'
        RETURNING id
    )
    SELECT array_agg(id) INTO slot_ids FROM slots;

    -- Create slot group
    INSERT INTO booking_slot_groups (
        booking_id,
        slot_ids,
        start_time,
        end_time,
        duration
    ) VALUES (
        NEW.id,
        slot_ids,
        NEW.start_time,
        NEW.end_time,
        EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))/60
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking creation
CREATE TRIGGER on_booking_created
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION mark_slots_as_booked();

-- Create function to mark slots as available when booking is cancelled
CREATE OR REPLACE FUNCTION mark_slots_as_available()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' THEN
        -- Get slot IDs from slot group
        WITH slot_group AS (
            SELECT slot_ids
            FROM booking_slot_groups
            WHERE booking_id = NEW.id
        )
        UPDATE booking_slots
        SET status = 'available',
            booking_id = NULL
        WHERE id = ANY((SELECT slot_ids FROM slot_group));

        -- Delete slot group
        DELETE FROM booking_slot_groups WHERE booking_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking cancellation
CREATE TRIGGER on_booking_cancelled
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION mark_slots_as_available();

-- Create function to check slot availability before booking
CREATE OR REPLACE FUNCTION check_slots_availability()
RETURNS TRIGGER AS $$
DECLARE
    required_slots INTEGER;
BEGIN
    -- Get required number of 15-minute slots based on appointment type duration
    SELECT CEIL(duration::float / 15)
    INTO required_slots
    FROM appointment_types
    WHERE id = NEW.appointment_type_id;

    -- Check if we have enough consecutive available slots
    IF NOT EXISTS (
        SELECT 1
        FROM (
            SELECT COUNT(*) as available_slots
            FROM booking_slots
            WHERE user_id = NEW.user_id
            AND start_time >= NEW.start_time
            AND end_time <= NEW.end_time
            AND status = 'available'
        ) counts
        WHERE counts.available_slots >= required_slots
    ) THEN
        RAISE EXCEPTION 'Required slots are not available';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for checking slot availability
CREATE TRIGGER check_slots_before_booking
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION check_slots_availability();
