import { z } from 'zod'

export const createBookingSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email address'),
  customer_company: z.string().optional(),
  notes: z.string().optional(),
  start_time: z.string().datetime('Invalid start time'),
  end_time: z.string().datetime('Invalid end time'),
  user_id: z.string().uuid('Invalid user ID')
})

export type CreateBookingSchema = z.infer<typeof createBookingSchema> 