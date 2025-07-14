import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createDataForSEOClient } from '@/lib/dataforseo/client';
import { KeywordResearch } from '@/types/seo';
import { getKeywordGenerationDescription } from '@/lib/brand-info';
import { GoogleGenAI } from '@google/genai';

interface AIKeywordRequest {
  project_id: string;
  company_description?: string;
  domain?: string;
  existing_keywords: string[];
  location_code?: number;
  language_code?: string;
  count?: number;
}

interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  search_intent: string;
}

interface AIGenerationResults {
  keywords: KeywordResearch[];
  suggestions: KeywordSuggestion[];
  cost: number;
  generated_keywords: string[];
}

/**
 * POST /api/seo/keywords/ai-generate
 * Generate keywords using AI and research them with DataForSEO
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/seo/keywords/ai-generate]');
    
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
    const body: AIKeywordRequest = await request.json();
    
    // Validate required fields
    if (!body.project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const { data: project } = await supabase
      .from('seo_projects')
      .select('id, domain, name, description')
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
    const keywordCount = body.count || 10;
    
    const results: AIGenerationResults = {
      keywords: [],
      suggestions: [],
      cost: 0,
      generated_keywords: [],
    };

    try {
      // 5. Generate keywords using Gemini AI
      console.log('🤖 Generating keywords with Gemini AI...');
      
      const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
      if (!API_KEY) {
        throw new Error('Google AI Studio API key not configured');
      }

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      // Prepare the prompt
      const companyDescription = body.company_description || 
                                project.description || 
                                getKeywordGenerationDescription();
      
      const domain = body.domain || project.domain;
      const existingKeywords = body.existing_keywords || [];
      
      const targetLocation = getLocationName(locationCode);
      const targetLanguage = getLanguageName(languageCode);
      
      const prompt = `You are an expert SEO keyword researcher specializing in ${targetLocation} and ${targetLanguage} markets. Generate ${keywordCount} highly relevant, SEO-optimized keywords for the following business:

Company/Domain: ${domain}
Description: ${companyDescription}
Target Location: ${targetLocation}
Target Language: ${targetLanguage}
Market Context: ${getMarketContext(locationCode, languageCode)}

EXISTING KEYWORDS TO AVOID (do not include any of these):
${existingKeywords.length > 0 ? existingKeywords.join(', ') : 'None'}

Requirements:
1. Generate exactly ${keywordCount} unique keywords in ${targetLanguage}
2. Prioritize keywords that are likely to have measurable search volume and commercial intent in ${targetLocation}.
3. Include a strategic mix of:
   - Foundational 'head' terms (1-2 words)
   - Popular long-tail keywords (3-5 words with clear user intent)
   - Question-based keywords
   - Commercial investigation keywords
4. Use natural ${targetLanguage} phrasing and terminology.
5. Avoid the existing keywords listed above.
6. Return ONLY the keywords, one per line, no numbering or formatting.

Generate keywords that are likely to have data in SEO tools for the ${targetLocation} market:

Keywords:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });

      const generatedText = response.text || '';
      console.log('🤖 AI generated response:', generatedText);

      if (!generatedText) {
        throw new Error('No response generated by AI');
      }

      // Parse the generated keywords
      const generatedKeywords = generatedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.match(/^\d+\./) && line.length > 2)
        .map(keyword => keyword.replace(/[?]/g, '')) // Sanitize by removing question marks
        .slice(0, keywordCount);

      console.log('🤖 Parsed keywords:', generatedKeywords);
      results.generated_keywords = generatedKeywords;

      if (generatedKeywords.length === 0) {
        throw new Error('No valid keywords generated by AI');
      }

      // 6. Research the generated keywords with DataForSEO
      console.log('📊 Researching AI-generated keywords with DataForSEO...');
      
      const dataForSEOClient = createDataForSEOClient();

      // Get keyword data for all generated keywords
      const keywordDataResponse = await dataForSEOClient.getLiveKeywordData({
        keywords: generatedKeywords,
        location_code: locationCode,
        language_code: languageCode,
      });

      console.log('📊 Raw DataForSEO keyword data response:', JSON.stringify(keywordDataResponse, null, 2));

      if (keywordDataResponse && keywordDataResponse.status_code === 20000) {
        results.cost += keywordDataResponse.cost || 0;
        
        // Process keyword data results into a map for easy lookup
        const keywordDataMap = new Map<string, KeywordSuggestion>();
        if (keywordDataResponse.tasks && keywordDataResponse.tasks.length > 0) {
          const task = keywordDataResponse.tasks[0];
          if (task.result && task.result.length > 0) {
            for (const keywordData of task.result) {
              const competitionIndex = (keywordData as any).competition_index;
              keywordDataMap.set(keywordData.keyword, {
                keyword: keywordData.keyword || '',
                search_volume: keywordData.search_volume || 0,
                cpc: keywordData.cpc || 0,
                competition: typeof competitionIndex === 'number' ? competitionIndex / 100 : 0,
                difficulty: 0, // Default difficulty
                search_intent: (keywordData as any).search_intent || 'informational',
              });
            }
          }
        }
        
        // Fetch keyword difficulty for the same keywords
        try {
          const difficultyResponse = await dataForSEOClient.getKeywordDifficulty(
            generatedKeywords,
            locationCode,
            languageCode
          );

          if (difficultyResponse && difficultyResponse.status_code === 20000) {
            results.cost += difficultyResponse.cost || 0;
            
            const difficultyItems = difficultyResponse.tasks?.[0]?.result?.[0]?.items;

            if (difficultyItems) {
              for (const item of difficultyItems) {
                // Perform a case-insensitive lookup to find the original keyword
                const originalKeyword = generatedKeywords.find(k => k.toLowerCase() === item.keyword.toLowerCase());
                
                if (originalKeyword) {
                  const suggestion = keywordDataMap.get(originalKeyword);
                  if (suggestion && typeof item.keyword_difficulty === 'number') {
                    suggestion.difficulty = item.keyword_difficulty;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Error fetching keyword difficulty:', error);
        }
        
        results.suggestions = Array.from(keywordDataMap.values());
      }

      // 7. Store the API call details for auditing
      if (results.cost > 0) {
        await supabase
          .from('dataforseo_tasks')
          .insert({
            project_id: body.project_id,
            task_id: `ai_keyword_generation_${Date.now()}`,
            task_type: 'ai_keyword_generation',
            status: 'completed',
            request_data: body,
            response_data: {
              generated_keywords: results.generated_keywords,
              keywords_count: results.keywords.length,
              suggestions_count: results.suggestions.length,
              total_cost: results.cost,
            },
          });
      }

      return NextResponse.json({
        success: true,
        data: results,
        message: `Successfully generated ${results.generated_keywords.length} AI keywords with ${results.suggestions.length} suggestions ready to save`,
      }, { status: 200 });

    } catch (aiError) {
      console.error('AI keyword generation error:', aiError);
      
      // Return partial results if we have any, with error info
      return NextResponse.json({
        success: false,
        data: results,
        error: 'AI keyword generation error',
        message: aiError instanceof Error ? aiError.message : 'Failed to complete AI keyword generation',
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error('Error in POST /api/seo/keywords/ai-generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get location name from code
function getLocationName(locationCode: number): string {
  const locations: { [key: number]: string } = {
    2840: 'United States',
    2826: 'United Kingdom', 
    2124: 'Canada',
    2276: 'Germany',
    2250: 'France',
    2752: 'Sweden',
    2246: 'Finland',
  };
  
  return locations[locationCode] || 'United States';
}

// Helper function to get language name from code
function getLanguageName(languageCode: string): string {
  const languages: { [key: string]: string } = {
    'en': 'English',
    'fi': 'Finnish',
    'sv': 'Swedish',
    'de': 'German',
    'fr': 'French',
  };
  
  return languages[languageCode] || 'English';
}

// Helper function to get market context for location and language
function getMarketContext(locationCode: number, languageCode: string): string {
  const contexts: { [key: string]: string } = {
    '2840_en': 'Large competitive market with high search volumes. Focus on commercial intent and brand differentiation.',
    '2826_en': 'Mature market with sophisticated users. Emphasize quality, reliability, and professional services.',
    '2124_en': 'Bilingual market (English/French). Consider cross-border commerce and local preferences.',
    '2276_de': 'Quality-focused market with technical users. Emphasize precision, efficiency, and engineering excellence.',
    '2250_fr': 'Style-conscious market with emphasis on elegance and sophistication.',
    '2752_sv': 'Tech-savvy market with high digital adoption. Focus on innovation and sustainability.',
    '2246_fi': 'Technology-forward market with high trust in digital solutions. Emphasize reliability and innovation.',
  };
  
  const key = `${locationCode}_${languageCode}`;
  return contexts[key] || 'Competitive market with diverse user needs. Focus on clear value proposition and local relevance.';
} 