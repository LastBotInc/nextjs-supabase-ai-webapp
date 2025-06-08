import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createDataForSEOClient } from '@/lib/dataforseo/client';
import { SERPTaskRequest } from '@/types/seo';

interface SERPAnalysisRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
}

/**
 * POST /api/seo/serp/analysis
 * Fetches live SERP results for a given keyword from DataForSEO
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/seo/serp/analysis]');
    
    // 1. Authenticate and authorize admin user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1]);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // 2. Parse and validate request body
    const body: SERPAnalysisRequest = await request.json();
    const { keyword, location_code, language_code } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // 3. Call DataForSEO SERP API
    console.log(`📊 Fetching live SERP for keyword: "${keyword}"`);
    const dataForSEOClient = createDataForSEOClient();
    
    const serpTask: SERPTaskRequest = {
      keyword,
      location_code: location_code || 2246, // Default to Finland
      language_code: language_code || 'fi', // Default to Finnish
      depth: 10, // Top 10 results
    };

    const serpResponse = await dataForSEOClient.getLiveSERPResults(serpTask);

    console.log(`✅ Successfully fetched SERP for "${keyword}"`);

    // 4. Return the results
    return NextResponse.json({
      success: true,
      data: serpResponse,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in POST /api/seo/serp/analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 