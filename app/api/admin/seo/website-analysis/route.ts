import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getDataForSEOConfig } from '@/lib/dataforseo/config';

interface WebsiteAnalysisRequest {
  domain: string;
  location_name?: string;
  language_name?: string;
  includeKeywords?: boolean;
  includeBacklinks?: boolean;
  includeCompetitors?: boolean;
  includeTechnical?: boolean;
  keywordLimit?: number;
}

interface WebsiteAnalysisResult {
  domain: string;
  domainOverview: {
    organicKeywords: number;
    organicTraffic: number;
    paidKeywords: number;
    paidTraffic: number;
    backlinks: number;
    referringDomains: number;
    domainRank: number;
  };
  rankedKeywords: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
    cpc: number;
    competition: number;
    url: string;
    title: string;
  }>;
  keywordsForSite: Array<{
    keyword: string;
    searchVolume: number;
    cpc: number;
    competition: number;
    difficulty: number;
  }>;
  competitors: Array<{
    domain: string;
    organicKeywords: number;
    organicTraffic: number;
    intersections: number;
    rank: number;
  }>;
  backlinks: {
    totalBacklinks: number;
    referringDomains: number;
    rank: number;
    spamScore: number;
  };
  technicalSeo: {
    title: string;
    description: string;
    h1: string;
    loadTime: number;
    mobileOptimized: boolean;
    httpsEnabled: boolean;
    issues: Array<string>;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/admin/seo/website-analysis]');

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    console.log('🔑 Auth token: present');

    // 2. Create auth client and verify token
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

    // 4. Get request data
    const requestData: WebsiteAnalysisRequest = await request.json();
    const { 
      domain, 
      location_name = 'United States',
      language_name = 'English',
      includeKeywords = true, 
      includeBacklinks = true, 
      includeCompetitors = true, 
      includeTechnical = true,
      keywordLimit = 50 
    } = requestData;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    console.log('📊 Starting analysis for domain:', domain);
    console.log('📊 Analysis options:', { includeKeywords, includeBacklinks, includeCompetitors, includeTechnical, keywordLimit });
    console.log('🌍 Location settings:', { location_name, language_name });

    // Convert language name to language code
    const languageMap: { [key: string]: string } = {
      'English': 'en',
      'Finnish': 'fi',
      'Swedish': 'sv',
      'German': 'de',
      'French': 'fr',
      'Spanish': 'es',
      'Norwegian': 'no',
      'Danish': 'da'
    };
    const language_code = languageMap[language_name] || 'en';
    console.log('🗣️ Using language code:', language_code);

    // 5. Get DataForSEO configuration
    const config = getDataForSEOConfig();
    console.log('🔑 DataForSEO config loaded:', { login: config.login, hasPassword: !!config.password });
    
    const auth = Buffer.from(`${config.login}:${config.password}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    const result: WebsiteAnalysisResult = {
      domain,
      domainOverview: {
        organicKeywords: 0,
        organicTraffic: 0,
        paidKeywords: 0,
        paidTraffic: 0,
        backlinks: 0,
        referringDomains: 0,
        domainRank: 0,
      },
      rankedKeywords: [],
      keywordsForSite: [],
      competitors: [],
      backlinks: {
        totalBacklinks: 0,
        referringDomains: 0,
        rank: 0,
        spamScore: 0,
      },
      technicalSeo: {
        title: '',
        description: '',
        h1: '',
        loadTime: 0,
        mobileOptimized: false,
        httpsEnabled: false,
        issues: [],
      },
    };

    // 6. Perform DataForSEO API calls
    try {
      // Domain Overview
      console.log('📊 Fetching domain overview...');
      const domainOverviewPayload = [{
        target: domain,
        language_code: language_code,
        location_name: location_name,
      }];
      console.log('📤 Domain overview payload:', JSON.stringify(domainOverviewPayload, null, 2));
      
      const domainOverviewResponse = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(domainOverviewPayload),
      });

      console.log('📥 Domain overview response status:', domainOverviewResponse.status);
      
      if (domainOverviewResponse.ok) {
        const overviewData = await domainOverviewResponse.json();
        console.log('📥 Domain overview response status:', domainOverviewResponse.status);
        
        if (overviewData.tasks?.[0]?.result?.[0]) {
          const domainData = overviewData.tasks[0].result[0];
          console.log('📊 Domain overview data found');
          
          result.domainOverview = {
            organicKeywords: domainData.metrics?.organic?.count || 0,
            organicTraffic: domainData.metrics?.organic?.etv || 0,
            paidKeywords: domainData.metrics?.paid?.count || 0,
            paidTraffic: domainData.metrics?.paid?.etv || 0,
            backlinks: 0, // Will be updated from backlinks API
            referringDomains: 0, // Will be updated from backlinks API
            domainRank: 0, // Will be updated from backlinks API
          };
          console.log('✅ Domain overview processed');
        } else {
          console.log('⚠️ No domain overview data found');
        }
      } else {
        console.error('❌ Domain overview API failed:', domainOverviewResponse.status);
      }

      // Ranked Keywords
      if (includeKeywords) {
        console.log('📊 Fetching ranked keywords...');
        const rankedKeywordsPayload = [{
          target: domain,
          language_code: language_code,
          location_name: location_name,
          limit: keywordLimit,
          order_by: ['keyword_data.keyword_info.search_volume,desc'],
        }];
        console.log('📤 Ranked keywords payload:', JSON.stringify(rankedKeywordsPayload, null, 2));

        const rankedKeywordsResponse = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live', {
          method: 'POST',
          headers,
          body: JSON.stringify(rankedKeywordsPayload),
        });

        console.log('📥 Ranked keywords response status:', rankedKeywordsResponse.status);

        if (rankedKeywordsResponse.ok) {
          const rankedKeywordsData = await rankedKeywordsResponse.json();
          console.log('📥 Ranked keywords response status:', rankedKeywordsResponse.status);
          
          if (rankedKeywordsData.tasks?.[0]?.result?.[0]?.items) {
            const items = rankedKeywordsData.tasks[0].result[0].items;
            console.log(`📊 Processing ${items.length} ranked keywords`);
            
            result.rankedKeywords = items.map((item: any) => {
              const keywordData = item.keyword_data;
              const serpElement = item.ranked_serp_element;
              
              // Calculate position from metrics
              let position = 0;
              if (rankedKeywordsData.tasks[0].result[0].metrics?.organic) {
                const metrics = rankedKeywordsData.tasks[0].result[0].metrics.organic;
                if (metrics.pos_1 > 0) position = 1;
                else if (metrics.pos_2_3 > 0) position = 2;
                else if (metrics.pos_4_10 > 0) position = 7;
                else if (metrics.pos_11_20 > 0) position = 15;
                else if (metrics.pos_21_30 > 0) position = 25;
                else if (metrics.pos_31_40 > 0) position = 35;
                else if (metrics.pos_41_50 > 0) position = 45;
                else if (metrics.pos_51_60 > 0) position = 55;
                else if (metrics.pos_61_70 > 0) position = 65;
                else if (metrics.pos_71_80 > 0) position = 75;
                else if (metrics.pos_81_90 > 0) position = 85;
                else if (metrics.pos_91_100 > 0) position = 95;
              }
              
              return {
                keyword: keywordData?.keyword || 'Unknown',
                position: position,
                searchVolume: keywordData?.keyword_info?.search_volume || 0,
                cpc: keywordData?.keyword_info?.cpc || 0,
                competition: keywordData?.keyword_info?.competition || 0,
                url: serpElement?.url || '',
                title: serpElement?.title || ''
              };
            });
            console.log('✅ Ranked keywords processed:', result.rankedKeywords.length);
          } else {
            console.log('⚠️ No ranked keywords data found in response');
          }
        } else {
          console.error('❌ Ranked keywords API failed:', rankedKeywordsResponse.status);
        }

        // Keywords for Site
        console.log('📊 Fetching keywords for site...');
        const keywordsForSitePayload = [{
          target: domain,
          language_code: language_code,
          location_name: location_name,
          limit: keywordLimit,
          order_by: ['keyword_info.search_volume,desc'],
        }];
        console.log('📤 Keywords for site payload:', JSON.stringify(keywordsForSitePayload, null, 2));

        const keywordsForSiteResponse = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live', {
          method: 'POST',
          headers,
          body: JSON.stringify(keywordsForSitePayload),
        });

        console.log('📥 Keywords for site response status:', keywordsForSiteResponse.status);

        if (keywordsForSiteResponse.ok) {
          const keywordsForSiteData = await keywordsForSiteResponse.json();
          console.log('📥 Keywords for site response status:', keywordsForSiteResponse.status);
          
          if (keywordsForSiteData.tasks?.[0]?.result?.[0]?.items) {
            const items = keywordsForSiteData.tasks[0].result[0].items;
            console.log(`📊 Processing ${items.length} keywords for site`);
            
            // Filter for relevant keywords (AI, technology, business related)
            const relevantKeywords = items.filter((item: any) => {
              const keyword = item.keyword?.toLowerCase() || '';
              const isRelevant = keyword.includes('ai') || 
                               keyword.includes('artificial intelligence') ||
                               keyword.includes('technology') ||
                               keyword.includes('business') ||
                               keyword.includes('automation') ||
                               keyword.includes('lastbot') ||
                               keyword.includes('last') ||
                               keyword.includes('bot') ||
                               keyword.includes('solution') ||
                               keyword.includes('software') ||
                               keyword.includes('digital');
              
              // Also filter out obviously irrelevant keywords
              const isIrrelevant = keyword.includes('food') ||
                                 keyword.includes('restaurant') ||
                                 keyword.includes('near me') ||
                                 keyword.includes('delivery') ||
                                 keyword.includes('pizza') ||
                                 keyword.includes('burger');
              
              return isRelevant && !isIrrelevant && item.keyword_info?.search_volume > 0;
            });

            console.log(`📊 Filtered to ${relevantKeywords.length} relevant keywords`);
            
            result.keywordsForSite = relevantKeywords.slice(0, 50).map((item: any) => ({
              keyword: item.keyword,
              searchVolume: item.keyword_info?.search_volume || 0,
              cpc: item.keyword_info?.cpc || 0,
              competition: item.keyword_info?.competition || 0,
              difficulty: item.keyword_properties?.keyword_difficulty || 0
            }));
            console.log('✅ Keywords for site processed:', result.keywordsForSite.length);
          } else {
            console.log('⚠️ No keywords for site data found in response');
          }
        } else {
          console.error('❌ Keywords for site API failed:', keywordsForSiteResponse.status);
        }
      }

      // Competitors
      if (includeCompetitors) {
        console.log('📊 Fetching competitors...');
        const competitorsPayload = [{
          target: domain,
          language_code: language_code,
          location_name: location_name,
          limit: 20,
          order_by: ['metrics.organic.count,desc'],
        }];
        console.log('📤 Competitors payload:', JSON.stringify(competitorsPayload, null, 2));

        const competitorsResponse = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live', {
          method: 'POST',
          headers,
          body: JSON.stringify(competitorsPayload),
        });

        console.log('📥 Competitors response status:', competitorsResponse.status);

        if (competitorsResponse.ok) {
          const competitorsData = await competitorsResponse.json();
          console.log('📥 Competitors response status:', competitorsResponse.status);
          
          if (competitorsData.tasks?.[0]?.result) {
            const competitors = competitorsData.tasks[0].result;
            console.log(`📊 Processing ${competitors.length} competitors`);
            
            result.competitors = competitors.slice(0, 10).map((competitor: any) => ({
              domain: competitor.target || '',
              organicKeywords: competitor.metrics?.organic?.count || 0,
              organicTraffic: competitor.metrics?.organic?.etv || 0,
              intersections: competitor.intersections || 0,
            }));
            console.log('✅ Competitors processed:', result.competitors.length);
          } else {
            console.log('⚠️ No competitors data found');
          }
        } else {
          console.error('❌ Competitors API failed:', competitorsResponse.status);
        }
      }

      // Backlinks
      if (includeBacklinks) {
        console.log('📊 Fetching backlinks summary...');
        const backlinksPayload = [{
          target: domain,
        }];
        console.log('📤 Backlinks payload:', JSON.stringify(backlinksPayload, null, 2));

        const backlinksResponse = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
          method: 'POST',
          headers,
          body: JSON.stringify(backlinksPayload),
        });

        console.log('📥 Backlinks response status:', backlinksResponse.status);

        if (backlinksResponse.ok) {
          const backlinksData = await backlinksResponse.json();
          console.log('📥 Backlinks response:', JSON.stringify(backlinksData, null, 2));
          
          if (backlinksData.tasks?.[0]?.result?.[0]) {
            const backlinksInfo = backlinksData.tasks[0].result[0];
            console.log('📊 Backlinks data found');
            
            // Update domain overview with backlinks data
            result.domainOverview.backlinks = backlinksInfo.backlinks || 0;
            result.domainOverview.referringDomains = backlinksInfo.referring_domains || 0;
            result.domainOverview.domainRank = backlinksInfo.rank || 0;
            
            result.backlinks = {
              totalBacklinks: backlinksInfo.backlinks || 0,
              referringDomains: backlinksInfo.referring_domains || 0,
              rank: backlinksInfo.rank || 0,
              spamScore: backlinksInfo.spam_score || 0,
            };
            console.log('✅ Backlinks processed');
          } else {
            console.log('⚠️ No backlinks data found');
          }
        } else {
          console.error('❌ Backlinks API failed:', backlinksResponse.status);
        }
      }

      // Technical SEO
      if (includeTechnical) {
        console.log('📊 Fetching technical SEO data...');
        const technicalPayload = [{
          url: `https://${domain}`,
          enable_javascript: true,
        }];
        console.log('📤 Technical SEO payload:', JSON.stringify(technicalPayload, null, 2));

        const technicalResponse = await fetch('https://api.dataforseo.com/v3/on_page/instant_pages', {
          method: 'POST',
          headers,
          body: JSON.stringify(technicalPayload),
        });

        console.log('📥 Technical SEO response status:', technicalResponse.status);

        if (technicalResponse.ok) {
          const technicalData = await technicalResponse.json();
          console.log('📥 Technical SEO response:', JSON.stringify(technicalData, null, 2));
          
          if (technicalData.tasks?.[0]?.result?.[0]) {
            const pageData = technicalData.tasks[0].result[0];
            console.log('📊 Technical SEO data found');
            
            // Extract the first item from the results
            const item = pageData.items?.[0];
            if (item) {
              result.technicalSeo = {
                title: item.meta?.title || 'Not found',
                description: item.meta?.description || 'Not found',
                h1: item.meta?.htags?.h1?.[0] || 'Not found',
                loadTime: item.page_timing?.duration_time || 0,
                mobileOptimized: item.checks?.is_https && !item.checks?.no_mobile_optimization || false,
                httpsEnabled: item.checks?.is_https || false,
                issues: [],
              };
              
              // Add technical issues based on checks
              const checks = item.checks || {};
              if (checks.title_too_long) result.technicalSeo.issues.push('Title too long');
              if (checks.title_too_short) result.technicalSeo.issues.push('Title too short');
              if (checks.no_description) result.technicalSeo.issues.push('Missing meta description');
              if (checks.no_h1_tag) result.technicalSeo.issues.push('Missing H1 tag');
              if (checks.duplicate_title_tag) result.technicalSeo.issues.push('Duplicate title tags');
              if (checks.duplicate_meta_tags) result.technicalSeo.issues.push('Duplicate meta tags');
              if (checks.no_image_alt) result.technicalSeo.issues.push('Images missing alt text');
              if (checks.has_render_blocking_resources) result.technicalSeo.issues.push('Render blocking resources');
              if (checks.low_content_rate) result.technicalSeo.issues.push('Low content rate');
              
            } else {
              result.technicalSeo = {
                title: 'Not found',
                description: 'Not found',
                h1: 'Not found',
                loadTime: 0,
                mobileOptimized: false,
                httpsEnabled: false,
                issues: [],
              };
            }
            console.log('✅ Technical SEO processed');
          } else {
            console.log('⚠️ No technical SEO data found');
          }
        } else {
          console.error('❌ Technical SEO API failed:', technicalResponse.status);
        }
      }

      console.log('✅ Analysis completed successfully');
      console.log('📊 Final result summary:', {
        domain: result.domain,
        domainOverview: result.domainOverview,
        rankedKeywordsCount: result.rankedKeywords.length,
        keywordsForSiteCount: result.keywordsForSite.length,
        competitorsCount: result.competitors.length,
        backlinks: result.backlinks,
        technicalSeo: result.technicalSeo
      });
      
      return NextResponse.json({ data: result });

    } catch (apiError) {
      console.error('❌ DataForSEO API error:', apiError);
      return NextResponse.json(
        { error: 'Failed to fetch SEO data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error in website analysis:', {
      endpoint: '/api/admin/seo/website-analysis',
      method: 'POST',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 