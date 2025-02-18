import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testCreateSession() {
  console.log('Testing direct session creation...')
  
  const sessionId = '12345678-1234-1234-1234-123456789012'
  const session = {
    id: sessionId,
    first_page: '/test',
    user_agent: 'Test Agent',
    device_type: 'test'
  }

  const { data, error } = await supabase
    .from('analytics_sessions')
    .upsert([session])
    .select()

  if (error) {
    console.error('Error creating test session:', error)
    return null
  }

  console.log('Test session created successfully:', data)
  return sessionId
}

async function testCreateEvent(sessionId: string) {
  console.log('Testing direct event creation...')
  
  const event = {
    event_type: 'test_event',
    page_url: '/test',
    session_id: sessionId,
    locale: 'en',
    user_agent: 'Test Agent',
    device_type: 'test',
    metadata: { test: true }
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .insert([event])
    .select()

  if (error) {
    console.error('Error creating test event:', error)
    return
  }

  console.log('Test event created successfully:', data)
}

async function checkAnalytics() {
  console.log('Checking analytics data...\n')

  // Try to create a test session and event
  const sessionId = await testCreateSession()
  if (sessionId) {
    await testCreateEvent(sessionId)
  }

  // Check sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('analytics_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError)
    return
  }

  console.log('\nLatest 5 Sessions:')
  console.log('----------------')
  sessions.forEach(session => {
    console.log(`ID: ${session.id}`)
    console.log(`First Page: ${session.first_page}`)
    console.log(`User ID: ${session.user_id || 'Anonymous'}`)
    console.log(`Device: ${session.device_type}`)
    console.log(`Created: ${new Date(session.created_at).toLocaleString()}`)
    console.log('----------------')
  })

  // Check events
  const { data: events, error: eventsError } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
    return
  }

  console.log('\nLatest 5 Events:')
  console.log('----------------')
  events.forEach(event => {
    console.log(`Type: ${event.event_type}`)
    console.log(`Page: ${event.page_url}`)
    console.log(`Session: ${event.session_id}`)
    console.log(`User ID: ${event.user_id || 'Anonymous'}`)
    console.log(`Created: ${new Date(event.created_at).toLocaleString()}`)
    console.log('----------------')
  })
}

// Run the check
checkAnalytics().catch(console.error) 