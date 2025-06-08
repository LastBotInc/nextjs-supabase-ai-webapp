import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createDataForSEOClient } from '@/lib/dataforseo/client';
import { KeywordResearch } from '@/types/seo';

interface KeywordResearchRequest {
  project_id: string;
  seed_keywords: string[];
  location_code?: number;
  language_code?: string;
  include_suggestions?: boolean;
}

interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  search_intent: string;
}

interface ResearchResults {
  keywords: KeywordResearch[];
  suggestions: KeywordSuggestion[];
  cost: number;
  tasks: any[];
}

/**
 * POST /api/seo/keywords/research
 * Perform keyword research using DataForSEO API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/seo/keywords/research]');
    
    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // 2. Create auth client and verify token
    console.log('🔑 Creating auth client...');
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    );

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // 3. Admin Role Verification Layer
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.error('❌ User is not admin:', user.id);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access verified');

    // 4. Create service role client for database operations
    console.log('🔑 Creating service role client...');
    const supabase = createClient(undefined, true);

    // Parse request body
    const body: KeywordResearchRequest = await request.json();
    
    // Validate required fields
    if (!body.project_id || !body.seed_keywords || body.seed_keywords.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and seed keywords are required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const { data: project } = await supabase
      .from('seo_projects')
      .select('id, domain, name')
      .eq('id', body.project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const locationCode = body.location_code || 2840; // Default to US
    const languageCode = body.language_code || 'en';
    const results: ResearchResults = {
      keywords: [],
      suggestions: [],
      cost: 0,
      tasks: [],
    };

    try {
      // Initialize DataForSEO client
      const dataForSEOClient = createDataForSEOClient();

      // Get keyword data (search volume, CPC, competition)
          console.log('📊 Calling DataForSEO getLiveKeywordData with:', {
      keywords: body.seed_keywords,
      location_code: locationCode,
      language_code: languageCode,
    });
    
    const keywordDataResponse = await dataForSEOClient.getLiveKeywordData({
      keywords: body.seed_keywords,
      location_code: locationCode,
      language_code: languageCode,
    });

    console.log('📊 DataForSEO keyword data response:', {
      status_code: keywordDataResponse?.status_code,
      status_message: keywordDataResponse?.status_message,
      cost: keywordDataResponse?.cost,
      tasks_count: keywordDataResponse?.tasks?.length,
      first_task_result_count: keywordDataResponse?.tasks?.[0]?.result?.length,
      first_task_status: keywordDataResponse?.tasks?.[0]?.status_code,
      first_task_message: keywordDataResponse?.tasks?.[0]?.status_message,
      full_response: JSON.stringify(keywordDataResponse, null, 2),
    });

      if (keywordDataResponse && keywordDataResponse.status_code === 20000) {
        results.cost += keywordDataResponse.cost || 0;
        
        // Process keyword data results
        if (keywordDataResponse.tasks && keywordDataResponse.tasks.length > 0) {
          const task = keywordDataResponse.tasks[0];
          console.log('📊 Processing keyword data task result:', {
            task_status: task.status_code,
            task_message: task.status_message,
            result_count: task.result?.length,
            first_result: task.result?.[0] ? JSON.stringify(task.result[0], null, 2) : 'no_result'
          });
          
          if (task.result && task.result.length > 0) {
            for (const keywordData of task.result) {
              // Save keyword research data to database
              const competitionIndex = (keywordData as any).competition_index;
              const { data: savedKeyword, error: saveError } = await supabase
                .from('keyword_research')
                .insert({
                  project_id: body.project_id,
                  keyword: keywordData.keyword,
                  search_volume: keywordData.search_volume || null,
                  cpc: keywordData.cpc || null,
                  competition: competitionIndex ? competitionIndex / 100 : null, // Convert to 0-1 scale
                  difficulty: null, // Will be filled by difficulty API
                  search_intent: 'unknown', // Will be determined by analysis
                  related_keywords: [],
                  trends_data: {
                    monthly_searches: keywordData.monthly_searches || [],
                    competition_level: (keywordData as any).competition || 'unknown',
                  },
                })
                .select()
                .single();

              console.log('💾 Saving keyword to database:', {
                keyword: keywordData.keyword,
                search_volume: keywordData.search_volume,
                cpc: keywordData.cpc,
                competition_raw: (keywordData as any).competition,
                competition_index: competitionIndex,
                competition_normalized: competitionIndex ? competitionIndex / 100 : null,
                save_error: saveError?.message
              });

              if (!saveError && savedKeyword) {
                results.keywords.push(savedKeyword as KeywordResearch);
              }
            }
          }
        }
      }

      // Get keyword suggestions if requested
      if (body.include_suggestions) {
        for (const seedKeyword of body.seed_keywords) {
          try {
            console.log(`📊 Calling DataForSEO getKeywordSuggestions for: "${seedKeyword}"`);
            
            const suggestionsResponse = await dataForSEOClient.getKeywordSuggestions(
              [seedKeyword],
              locationCode,
              languageCode
            );

            console.log(`📊 DataForSEO suggestions response for "${seedKeyword}":`, {
              status_code: suggestionsResponse?.status_code,
              status_message: suggestionsResponse?.status_message,
              cost: suggestionsResponse?.cost,
              tasks_count: suggestionsResponse?.tasks?.length,
              first_task_result_count: suggestionsResponse?.tasks?.[0]?.result?.length,
              first_task_status: suggestionsResponse?.tasks?.[0]?.status_code,
              first_task_message: suggestionsResponse?.tasks?.[0]?.status_message,
              task_result_structure: suggestionsResponse?.tasks?.[0]?.result ? 'has_result' : 'no_result',
              full_task: JSON.stringify(suggestionsResponse?.tasks?.[0], null, 2),
            });

            if (suggestionsResponse && suggestionsResponse.status_code === 20000) {
              results.cost += suggestionsResponse.cost || 0;
              
              if (suggestionsResponse.tasks && suggestionsResponse.tasks.length > 0) {
                const task = suggestionsResponse.tasks[0];
                if (task.result && task.result.length > 0) {
                  // Process suggestions and add to results
                  const suggestions: KeywordSuggestion[] = task.result.slice(0, 20).map((item: any) => ({
                    keyword: item.keyword || '',
                    search_volume: item.search_volume || 0,
                    cpc: item.cpc || 0,
                    competition: item.competition_index ? item.competition_index / 100 : 0,
                    difficulty: Math.floor(Math.random() * 100), // Mock difficulty for now
                    search_intent: item.search_intent || 'informational',
                  }));
                  
                  results.suggestions.push(...suggestions);
                }
              }
            }
          } catch (suggestionError) {
            console.warn(`Failed to get suggestions for "${seedKeyword}":`, suggestionError);
            // Continue with other keywords even if one fails
          }
        }
      }

      // Consolidate all keywords for difficulty check
      const allKeywords = [
        ...results.keywords.map(k => k.keyword),
        ...results.suggestions.map(s => s.keyword)
      ];
      const uniqueKeywords = [...new Set(allKeywords)];

      if (uniqueKeywords.length > 0) {
        try {
          console.log(`📊 Calling DataForSEO getKeywordDifficulty for ${uniqueKeywords.length} keywords.`);
          const difficultyResponse = await dataForSEOClient.getKeywordDifficulty(
            uniqueKeywords,
            locationCode,
            languageCode
          );

          if (difficultyResponse && difficultyResponse.status_code === 20000) {
            results.cost += difficultyResponse.cost || 0;

            if (difficultyResponse.tasks && difficultyResponse.tasks.length > 0 && difficultyResponse.tasks[0].result) {
              const difficultyData = difficultyResponse.tasks[0].result[0].items;
              const difficultyMap = new Map(difficultyData.map((item: any) => [item.keyword, item.keyword_difficulty]));

              // Update difficulty in the database
              for (const [keyword, difficulty] of difficultyMap.entries()) {
                await supabase
                  .from('keyword_research')
                  .update({ difficulty: typeof difficulty === 'number' ? difficulty : null })
                  .eq('project_id', body.project_id)
                  .eq('keyword', keyword);
              }

              // Update difficulty in the results objects
              results.keywords.forEach(k => {
                if (difficultyMap.has(k.keyword)) {
                  const difficulty = difficultyMap.get(k.keyword);
                  if (typeof difficulty === 'number') {
                    k.difficulty = difficulty;
                  }
                }
              });
              results.suggestions.forEach(s => {
                if (difficultyMap.has(s.keyword)) {
                  const difficulty = difficultyMap.get(s.keyword);
                  if (typeof difficulty === 'number') {
                    s.difficulty = difficulty;
                  }
                }
              });
            }
          }
        } catch (difficultyError) {
          console.error('Failed to get keyword difficulty:', difficultyError);
          // Continue without difficulty data if this fails
        }
      }

      // Store DataForSEO task records for monitoring
      if (results.cost > 0) {
        await supabase
          .from('dataforseo_tasks')
          .insert({
            project_id: body.project_id,
            task_id: `keyword_research_${Date.now()}`,
            task_type: 'keyword_research',
            status: 'completed',
            request_data: body,
            response_data: {
              keywords_count: results.keywords.length,
              suggestions_count: results.suggestions.length,
              total_cost: results.cost,
            },
          });
      }

      return NextResponse.json({
        success: true,
        data: results,
        message: `Successfully researched ${body.seed_keywords.length} keywords and found ${results.suggestions.length} suggestions`,
      }, { status: 200 });

    } catch (dataForSEOError) {
      console.error('DataForSEO API error:', dataForSEOError);
      
      // Return partial results if we have any, with error info
      return NextResponse.json({
        success: false,
        data: results,
        error: 'DataForSEO API error',
        message: dataForSEOError instanceof Error ? dataForSEOError.message : 'Failed to complete keyword research',
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error('Error in POST /api/seo/keywords/research:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seo/keywords/research
 * Get keyword research data for a project
 */
export async function GET(request: NextRequest) {
  try {
    console.log('\n📝 [GET /api/seo/keywords/research]');
    
    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // 2. Create auth client and verify token
    console.log('🔑 Creating auth client...');
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    );

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // 3. Admin Role Verification Layer
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.error('❌ User is not admin:', user.id);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access verified');

    // 4. Create service role client for database operations
    console.log('🔑 Creating service role client...');
    const supabase = createClient(undefined, true);

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

    // Fetch keyword research data
    const { data: keywords, error } = await supabase
      .from('keyword_research')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching keyword research:', error);
      return NextResponse.json(
        { error: 'Failed to fetch keyword research data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: keywords || [],
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/seo/keywords/research:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 