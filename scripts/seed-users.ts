import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { addDays, addMinutes, eachDayOfInterval, format, parse, setHours, setMinutes, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Parse command line arguments
const args = process.argv.slice(2)
const envArg = args.find(arg => arg.startsWith('--env='))
const env = envArg ? envArg.split('=')[1] : process.env.NODE_ENV || 'dev'

// Determine environment file
const envFile = env === 'production' || env === 'prod' ? '.env.production' : '.env.local'

// First clear any existing env vars we care about
const envVarsToReset = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD',
  'SEED_TEST_USER_EMAIL',
  'SEED_TEST_USER_PASSWORD'
]
envVarsToReset.forEach(key => {
  delete process.env[key]
})

// Log environment setup
console.log('Environment setup:', {
  NODE_ENV: process.env.NODE_ENV,
  env: env,
  envFile: envFile,
  cwd: process.cwd()
})

// Load environment variables from appropriate .env file
const envConfig = config({ 
  path: path.resolve(process.cwd(), envFile),
  override: true
})

if (envConfig.error) {
  throw new Error(`Error loading environment file ${envFile}: ${envConfig.error}`)
}

console.log(`Using environment: ${env} (${envFile})`)

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD',
  'SEED_TEST_USER_EMAIL',
  'SEED_TEST_USER_PASSWORD'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client with explicit environment variables
const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Log connection details (but not sensitive values)
console.log('Database connection:', {
  url: supabaseUrl,
  env: env,
  serviceKeyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
})

// Get user credentials from environment variables
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD!
const TEST_USER_EMAIL = process.env.SEED_TEST_USER_EMAIL!
const TEST_USER_PASSWORD = process.env.SEED_TEST_USER_PASSWORD!

// Validate credentials
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
  throw new Error('Missing required user credentials in environment variables')
}

async function deleteUserIfExists(email: string) {
  const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers()
  
  if (searchError) {
    console.log('Error searching for existing user:', searchError)
    return
  }

  const existingUser = existingUsers?.users.find(user => user.email === email)
  
  if (existingUser) {
    console.log(`Deleting existing user: ${email}...`)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id)
    if (deleteError) {
      console.log('Error deleting existing user:', deleteError)
    }
  }
}

async function createUser(email: string, password: string, isAdmin: boolean = false) {
  console.log(`Creating ${isAdmin ? 'admin' : 'test'} user: ${email}...`)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username: email.split('@')[0],
      full_name: isAdmin ? 'Admin User' : 'Test User',
      city: isAdmin ? 'Helsinki' : 'Tampere',
      birth_year: isAdmin ? 1980 : 1990,
      newsletter_subscription: false,
      marketing_consent: false
    }
  })

  if (authError) {
    console.error('Error creating user:', authError)
    throw authError
  }

  if (isAdmin) {
    // Set admin flag in profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', authUser.user.id)

    if (updateError) {
      console.error('Error setting admin flag:', updateError)
      throw updateError
    }
  }

  return authUser.user
}

async function createBookingSettings(userId: string, timezone: string = 'Europe/Helsinki') {
  console.log(`Creating booking settings for user: ${userId}...`)
  const { data: settings, error: settingsError } = await supabase
    .from('booking_settings')
    .insert({
      user_id: userId,
      timezone,
      default_duration: 30,
      buffer_before: 5,
      buffer_after: 5,
      available_hours: [
        {
          day: 1, // Monday
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 2, // Tuesday
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 3, // Wednesday
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 4, // Thursday
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 5, // Friday
          startTime: '09:00',
          endTime: '17:00'
        }
      ],
      unavailable_dates: []
    })
    .select()
    .single()

  if (settingsError) {
    console.error('Error creating booking settings:', settingsError)
    throw settingsError
  }

  return settings
}

async function createAppointmentType(userId: string) {
  console.log(`Creating appointment type for user: ${userId}...`)
  const { data: appointmentType, error: appointmentError } = await supabase
    .from('appointment_types')
    .insert({
      user_id: userId,
      name: 'Initial Consultation',
      slug: 'initial-consultation',
      description: 'A 30-minute initial consultation to discuss your project needs. NOTE: THIS IS JUST DEMO, NO REAL BOOKING WILL BE DONE.',
      duration: 30,
      price: 0,
      is_free: true,
      is_active: true
    })
    .select()
    .single()

  if (appointmentError) {
    console.error('Error creating appointment type:', appointmentError)
    throw appointmentError
  }

  return appointmentType
}

async function createBookingSlots(userId: string, appointmentTypeId: string, settings: any) {
  console.log('Creating booking slots...')
  const timezone = settings.timezone
  const startDate = new Date('2025-01-01')
  const endDate = new Date('2025-12-31')

  // Get all days in the range
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const slots = []

  for (const day of days) {
    const dayOfWeek = day.getDay()
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // Find available hours for this day
    const daySettings = settings.available_hours.find((h: any) => h.day === dayOfWeek)
    if (!daySettings) continue

    // Parse start and end times
    const startTime = parse(daySettings.startTime, 'HH:mm', day)
    const endTime = parse(daySettings.endTime, 'HH:mm', day)

    // Create 15-minute slots
    let currentTime = startTime
    while (currentTime < endTime) {
      const slotEnd = addMinutes(currentTime, 15)
      
      // Store times in UTC
      slots.push({
        user_id: userId,
        appointment_type_id: appointmentTypeId,
        start_time: currentTime.toISOString(),
        end_time: slotEnd.toISOString(),
        duration: 15,
        status: 'available'
      })

      currentTime = slotEnd
    }

    // Insert slots in batches of 100
    if (slots.length >= 100) {
      const { error } = await supabase
        .from('booking_slots')
        .insert(slots)

      if (error) {
        console.error('Error creating booking slots:', error)
        throw error
      }

      slots.length = 0 // Clear the array
    }
  }

  // Insert any remaining slots
  if (slots.length > 0) {
    const { error } = await supabase
      .from('booking_slots')
      .insert(slots)

    if (error) {
      console.error('Error creating booking slots:', error)
      throw error
    }
  }

  console.log('Successfully created booking slots')
}

async function seedData() {
  try {
    // Delete existing users
    await deleteUserIfExists(ADMIN_EMAIL)
    await deleteUserIfExists(TEST_USER_EMAIL)

    // Create admin user
    const adminUser = await createUser(ADMIN_EMAIL, ADMIN_PASSWORD, true)
    console.log('Admin user created successfully:', adminUser.id)

    // Create test user
    const testUser = await createUser(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    console.log('Test user created successfully:', testUser.id)

    // Create booking settings for admin user
    const settings = await createBookingSettings(adminUser.id)
    console.log('Booking settings created successfully')

    // Create appointment type for admin user
    const appointmentType = await createAppointmentType(adminUser.id)
    console.log('Appointment type created successfully')

    // Create booking slots for admin user
    await createBookingSlots(adminUser.id, appointmentType.id, settings)
    console.log('Booking slots created successfully')

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

// Run the seeding process
seedData().catch(console.error)
