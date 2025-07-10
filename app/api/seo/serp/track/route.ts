import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createDataForSEOClient } from '@/lib/dataforseo/client';
import { AddKeywordForm, SERPTaskRequest } from '@/types/seo';

/**
 * POST /api/seo/serp/track
 * Add keywords to track for SERP monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AddKeywordForm & { project_id: string } = await request.json();
    
    // Validate required fields
    if (!body.project_id || !body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and keywords are required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const { data: project } = await supabase
      .from('seo_projects')
      .select('id, domain')
      .eq('id', body.project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Check for existing keywords to avoid duplicates
    const { data: existingKeywords } = await supabase
      .from('serp_tracking')
      .select('keyword')
      .eq('project_id', body.project_id)
      .in('keyword', body.keywords);

    const existingKeywordList = existingKeywords?.map(k => k.keyword) || [];
    const newKeywords = body.keywords.filter(k => !existingKeywordList.includes(k));

    if (newKeywords.length === 0) {
      return NextResponse.json(
        { error: 'All keywords are already being tracked' },
        { status: 409 }
      );
    }

    try {
      // Initialize DataForSEO client
      const dataForSEOClient = createDataForSEOClient();

      // Prepare SERP tasks for DataForSEO
      const serpTasks: SERPTaskRequest[] = newKeywords.map(keyword => ({
        keyword,
        location_code: body.location_code || 2840, // Default to US
        language_code: body.language_code || 'en',
        device: 'desktop',
        tag: `project_${body.project_id}`,
      }));

      // Submit tasks to DataForSEO
      const response = await dataForSEOClient.postSERPTask(serpTasks);
      
      if (!response || response.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${response?.status_message || 'Unknown error'}`);
      }

      // Store tracking records in database
      const trackingRecords = newKeywords.map(keyword => ({
        project_id: body.project_id,
        keyword,
        location_code: body.location_code || 2840,
        language_code: body.language_code || 'en',
        search_engine: body.search_engine || 'google',
      }));

      const { data: insertedRecords, error: insertError } = await supabase
        .from('serp_tracking')
        .insert(trackingRecords)
        .select();

      if (insertError) {
        console.error('Error inserting SERP tracking records:', insertError);
        return NextResponse.json(
          { error: 'Failed to save tracking records' },
          { status: 500 }
        );
      }

      // Store DataForSEO tasks for monitoring
      const taskRecords = response.tasks.map((task, index) => ({
        project_id: body.project_id,
        task_id: task.id,
        task_type: 'serp_tracking',
        status: 'pending',
        request_data: serpTasks[index],
      }));

      await supabase
        .from('dataforseo_tasks')
        .insert(taskRecords);

      return NextResponse.json({
        success: true,
        data: {
          tracked_keywords: insertedRecords,
          dataforseo_tasks: response.tasks,
          cost: response.cost,
        },
        message: `Successfully added ${newKeywords.length} keywords for tracking`,
      }, { status: 201 });

    } catch (dataForSEOError) {
      console.error('DataForSEO API error:', dataForSEOError);
      
      // Still save the keywords for tracking even if DataForSEO fails
      const trackingRecords = newKeywords.map(keyword => ({
        project_id: body.project_id,
        keyword,
        location_code: body.location_code || 2840,
        language_code: body.language_code || 'en',
        search_engine: body.search_engine || 'google',
      }));

      const { data: insertedRecords, error: insertError } = await supabase
        .from('serp_tracking')
        .insert(trackingRecords)
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to save tracking records and DataForSEO API failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          tracked_keywords: insertedRecords,
          dataforseo_error: dataForSEOError instanceof Error ? dataForSEOError.message : 'DataForSEO API failed',
        },
        message: `Keywords saved for tracking, but initial SERP data fetch failed. Data will be collected on next update.`,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error in POST /api/seo/serp/track:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seo/serp/track
 * Get tracked keywords for a project
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const { data: project } = await supabase
      .from('seo_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get tracked keywords with latest data
    const { data: trackedKeywords, error } = await supabase
      .from('serp_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('tracked_at', { ascending: false });

    if (error) {
      console.error('Error fetching tracked keywords:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tracked keywords' },
        { status: 500 }
      );
    }

    // Group by keyword to get latest position for each
    const keywordMap = new Map();
    trackedKeywords?.forEach(record => {
      if (!keywordMap.has(record.keyword)) {
        keywordMap.set(record.keyword, record);
      }
    });

    const latestKeywords = Array.from(keywordMap.values());

    return NextResponse.json({
      success: true,
      data: latestKeywords,
    });

  } catch (error) {
    console.error('Error in GET /api/seo/serp/track:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seo/serp/track
 * Remove keywords from tracking
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { project_id, keywords } = body;
    
    if (!project_id || !keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and keywords are required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const { data: project } = await supabase
      .from('seo_projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Delete tracking records
    const { error } = await supabase
      .from('serp_tracking')
      .delete()
      .eq('project_id', project_id)
      .in('keyword', keywords);

    if (error) {
      console.error('Error deleting tracked keywords:', error);
      return NextResponse.json(
        { error: 'Failed to remove keywords from tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${keywords.length} keywords from tracking`,
    });

  } catch (error) {
    console.error('Error in DELETE /api/seo/serp/track:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 