import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    console.log('\n📝 [POST /api/admin/seo/technical-audit/status]')
    
    // 1. Verify authentication
    console.log('🔑 Creating auth client...')
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    )

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Check admin status
    console.log('🔐 Verifying admin status...')
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      console.error('❌ User is not admin')
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ Admin user authenticated:', user.id)

    // 3. Parse request body
    const { taskId } = await request.json()

    if (!taskId) {
      console.error('❌ Missing taskId parameter')
      return NextResponse.json(
        { error: 'Missing required parameter: taskId' },
        { status: 400 }
      )
    }

    console.log('🔍 Checking task status for:', taskId)

    // 4. Validate DataForSEO credentials
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      console.error('❌ DataForSEO credentials not configured')
      return NextResponse.json(
        { error: 'DataForSEO credentials not configured' },
        { status: 500 }
      )
    }

    const credentials = Buffer.from(
      `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
    ).toString('base64')

    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    }

    // 5. Check if task is ready - try multiple approaches
    console.log('📊 Checking task readiness using multiple methods...')
    
    // Method 1: Check tasks_ready endpoint
    const readyResponse = await fetch('https://api.dataforseo.com/v3/on_page/tasks_ready', {
      method: 'GET',
      headers,
    })

    const readyData = await readyResponse.json()
    console.log('📊 Tasks ready response:', {
      status_code: readyData.status_code,
      status_message: readyData.status_message,
      tasks_count: readyData.tasks?.length || 0,
      task_ids: readyData.tasks?.map((t: any) => t.id) || []
    })

    const isReady = readyData.tasks?.some((task: any) => task.id === taskId)
    console.log('📊 Task found in ready list:', isReady)

    // Method 2: Try to fetch results directly (in case task completed but not in ready list)
    console.log('📊 Attempting direct result fetch...')
    const pagesResponse = await fetch(`https://api.dataforseo.com/v3/on_page/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ id: taskId, limit: 1000 }]),
    })

    const pagesData = await pagesResponse.json()
    console.log('📊 Direct pages fetch response:', {
      status_code: pagesData.status_code,
      status_message: pagesData.status_message,
      has_results: !!pagesData.tasks?.[0]?.result,
      result_count: pagesData.tasks?.[0]?.result?.length || 0
    })

    // If direct fetch worked, task is complete
    if (pagesData.status_code === 20000 && pagesData.tasks?.[0]?.result?.length > 0) {
      console.log('✅ Task completed - results found via direct fetch')
      const pages = pagesData.tasks[0].result
      console.log('📊 Crawled pages count:', pages.length)

      // Process results
      const { processAuditResults } = await import('../route')
      const result = await processAuditResults(pages, taskId, headers)
      
      return NextResponse.json({
        status: 'completed',
        data: result
      })
    }

    // If neither method found results, check for specific error conditions
    if (pagesData.status_code === 40501) {
      console.log('❌ Task not found - may have expired or been invalid')
      return NextResponse.json({
        status: 'error',
        error: 'Task not found or has expired',
        details: 'The crawl task may have expired or the task ID is invalid'
      }, { status: 404 })
    }

    if (pagesData.status_code === 20001) {
      console.log('⏳ Task still in progress')
      return NextResponse.json({
        status: 'processing',
        message: 'Crawl task is still in progress'
      })
    }

    // If we get here, task is still processing
    console.log('⏳ Task not ready yet, continuing to poll...')
    return NextResponse.json({
      status: 'processing',
      message: 'Crawl task is still in progress'
    })

  } catch (error) {
    console.error('❌ Error checking task status:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to check task status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 