-- Add appointment_type_id to booking_slots
ALTER TABLE booking_slots 
ADD COLUMN appointment_type_id UUID REFERENCES appointment_types(id) ON DELETE CASCADE;

-- Enable RLS on appointment_types
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointment_types

-- Anyone can view active appointment types
CREATE POLICY "Anyone can view active appointment types"
    ON appointment_types FOR SELECT
    USING (is_active = true);

-- Users can manage their own appointment types
CREATE POLICY "Users can manage their own appointment types"
    ON appointment_types FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can manage all appointment types
CREATE POLICY "Admins can manage all appointment types"
    ON appointment_types FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Update booking_slots policies to consider appointment types
DROP POLICY IF EXISTS "Anyone can view available slots" ON booking_slots;
CREATE POLICY "Anyone can view available slots"
    ON booking_slots FOR SELECT
    USING (
        status = 'available' 
        AND EXISTS (
            SELECT 1 FROM appointment_types
            WHERE id = booking_slots.appointment_type_id
            AND is_active = true
        )
    );

-- Add indexes for better performance
CREATE INDEX idx_appointment_types_user_id ON appointment_types(user_id);
CREATE INDEX idx_appointment_types_is_active ON appointment_types(is_active);
CREATE INDEX idx_appointment_types_slug ON appointment_types(slug);
CREATE INDEX idx_booking_slots_appointment_type ON booking_slots(appointment_type_id);
