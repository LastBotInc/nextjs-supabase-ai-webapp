# Booking & Calendar Subsystem

## Overview

The Booking & Calendar subsystem provides comprehensive appointment scheduling and calendar management functionality. It enables users to book appointments, manage availability, and handle scheduling workflows. The system includes features for multiple appointment types, time zone handling, email notifications, and calendar integration. It's designed to support both service providers and customers with an intuitive booking experience.

This subsystem handles the complexity of scheduling logistics including availability management, conflict prevention, booking confirmations, and reminder notifications. It integrates with email services for communication and provides both public booking interfaces and administrative tools for managing appointments.

## Key Components

### Booking Interface (`app/[locale]/book/`)
- **[slug]/page.tsx**: Public booking page for services
- **[slug]/success/page.tsx**: Booking confirmation page
- **BookingForm.tsx**: Main booking form component
- **TimeSlotSelector.tsx**: Available time slot picker
- **CalendarGrid.tsx**: Visual calendar interface

### Admin Calendar (`app/[locale]/admin/calendar/`)
- **page.tsx**: Admin calendar dashboard
- **CalendarSettings.tsx**: Availability configuration
- **CalendarSlots.tsx**: Slot management interface
- **AppointmentTypes.tsx**: Service type configuration

### Booking Components (`components/booking/`)
- **SettingsPanel.tsx**: Provider settings management
- **SlotCreationForm.tsx**: Bulk slot creation
- **TimeSlotSelector.tsx**: Reusable time picker

### API Endpoints
- **app/api/booking/**: Booking management APIs
- **app/api/appointment-types/**: Service configuration

## Dependencies

### External Dependencies
- `date-fns`: Date manipulation and formatting
- `date-fns-tz`: Timezone handling
- `ics`: Calendar file generation
- `@sendgrid/mail`: Email notifications

### Internal Dependencies
- Database Layer: Booking data storage
- Authentication: User identification
- Email Service: Notifications
- Analytics: Booking metrics

## Entry Points

### Public Booking
1. **Service Selection**: `/[locale]/book/[service-slug]`
2. **Appointment Booking**: Form submission
3. **Confirmation**: `/[locale]/book/[slug]/success`

### Admin Management
1. **Calendar View**: `/[locale]/admin/calendar`
2. **Settings**: Availability and preferences
3. **Appointment Types**: Service configuration
4. **Account Bookings**: `/[locale]/account/appointments`

## Data Flow

### Booking Flow
1. Customer selects service type
2. Available slots fetched based on:
   - Provider availability
   - Existing bookings
   - Service duration
   - Time zone preferences
3. Customer selects time slot
4. Contact information collected
5. Booking created in database
6. Confirmation emails sent
7. Calendar invites generated
8. Success page displayed

### Availability Management
1. Provider sets working hours
2. Recurring availability patterns defined
3. Specific dates blocked/opened
4. Slots generated automatically
5. Real-time availability updates
6. Conflict prevention enforced

### Notification Flow
1. Booking triggers email events
2. Provider receives booking details
3. Customer gets confirmation
4. Reminder emails scheduled
5. Calendar invites attached
6. Cancellation links included

## Key Patterns

### Time Zone Handling
```typescript
// Convert slots to user's timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localSlots = slots.map(slot => ({
  ...slot,
  start: utcToZonedTime(slot.start_time, userTimeZone),
  end: utcToZonedTime(slot.end_time, userTimeZone)
}));
```

### Slot Generation
```typescript
// Generate recurring slots
function generateSlots(settings: CalendarSettings) {
  const slots = [];
  for (const day of settings.workingDays) {
    const daySlots = generateDaySlots({
      date: day,
      startTime: settings.startTime,
      endTime: settings.endTime,
      duration: settings.slotDuration,
      breakTime: settings.breakDuration
    });
    slots.push(...daySlots);
  }
  return slots;
}
```

### Booking Validation
```typescript
// Ensure slot is available
const isAvailable = await checkSlotAvailability({
  slot_id: selectedSlot,
  service_duration: appointmentType.duration
});

if (!isAvailable) {
  throw new Error('Slot no longer available');
}
```

## File Inventory

### Page Routes
- `app/[locale]/book/[slug]/page.tsx` - Booking page
- `app/[locale]/book/[slug]/success/page.tsx` - Success page
- `app/[locale]/admin/calendar/page.tsx` - Admin calendar
- `app/[locale]/account/appointments/page.tsx` - User bookings

### Components
- `components/booking/BookingForm.tsx` - Main booking form
- `components/booking/CalendarGrid.tsx` - Calendar view
- `components/booking/TimeSlotSelector.tsx` - Time picker
- `components/booking/SettingsPanel.tsx` - Settings UI
- `components/booking/SlotCreationForm.tsx` - Slot creator
- `components/TimeSlotSelector.tsx` - Shared time selector
- `components/admin/calendar/CalendarSettings.tsx` - Admin settings
- `components/admin/calendar/CalendarSlots.tsx` - Slot manager
- `components/admin/calendar/AppointmentTypes.tsx` - Service types

### API Routes
- `app/api/booking/create/route.ts` - Create booking
- `app/api/booking/slots/route.ts` - Get available slots
- `app/api/booking/host/bookings/route.ts` - Host bookings
- `app/api/booking/host/settings/route.ts` - Host settings
- `app/api/booking/host/slots/route.ts` - Manage slots
- `app/api/booking/host/slots/generate/route.ts` - Generate slots
- `app/api/appointment-types/route.ts` - Appointment types
- `app/api/appointment-types/[id]/route.ts` - Type operations

### Database Schema
- `booking_hosts` - Service provider profiles
- `booking_slots` - Available time slots
- `bookings` - Confirmed appointments
- `appointment_types` - Service definitions
- `calendar_settings` - Provider preferences

### Type Definitions
- `lib/types/booking.ts` - Booking type definitions
- `lib/validations/booking.ts` - Validation schemas
- Database types for booking tables

### Email Templates
- Booking confirmation emails
- Reminder notifications
- Cancellation messages
- Calendar invite generation

### Migration Files
- `20250214132738_create_booking_tables.sql` - Initial tables
- `20250215160840_update_booking_slots_constraint.sql` - Constraints
- `20250215161415_fix_booking_slots_constraint.sql` - Fixes
- `20250216120435_add_appointment_types.sql` - Service types

### Supporting Utilities
- Time zone conversion functions
- Calendar file generation
- Email notification handlers
- Availability calculation logic