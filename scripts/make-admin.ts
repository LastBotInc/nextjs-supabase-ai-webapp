import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function makeAdmin() {
  console.log('👑 Making user admin...')
  
  // Get the first user (or create a test user if none exist)
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
    return
  }
  
  if (!users || users.users.length === 0) {
    console.log('📝 No users found, creating test admin user...')
    
    // Create a test admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'admin123',
      email_confirm: true
    })
    
    if (createError) {
      console.error('❌ Error creating user:', createError)
      return
    }
    
    if (newUser.user) {
      console.log('✅ Created test user:', newUser.user.email)
      await updateUserProfile(newUser.user.id, newUser.user.email!)
    }
  } else {
    // Make the first existing user an admin
    const user = users.users[0]
    console.log('✅ Found existing user:', user.email)
    await updateUserProfile(user.id, user.email!)
  }
}

async function updateUserProfile(userId: string, email: string) {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (existingProfile) {
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId)
    
    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
    } else {
      console.log('✅ Updated user to admin:', email)
    }
  } else {
    // Create new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('❌ Error creating admin profile:', insertError)
    } else {
      console.log('✅ Created admin profile:', email)
    }
  }
}

makeAdmin().catch(console.error)