import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getDataForSEOConfig } from '@/lib/dataforseo/config';

interface BacklinkAnalysisRequest {
  domain: string;
  location_name?: string;
  language_name?: string;
  limit?: number;
  offset?: number;
  mode?: 'live' | 'task_get';
}

interface BacklinkItem {
  domain_from: string;
  url_from: string;
  domain_to: string;
  url_to: string;
  tld_from: string;
  is_new: boolean;
  is_lost: boolean;
  crawl_date: string;
  update_date: string;
  page_from_rank: number;
  domain_from_rank: number;
  page_from_external_links: number;
  domain_from_external_links: number;
  page_from_internal_links: number;
  domain_from_internal_links: number;
  page_from_size: number;
  encoding_from: string;
  lang_from: string;
  title_from: string;
  snippet_from: string;
  links_count: number;
  nofollow: boolean;
  original: boolean;
  alt: string;
  anchor: string;
  text_pre: string;
  text_post: string;
  semantic_location: string;
  link_attribute: string;
  page_from_scheme: string;
  redirect: boolean;
  redirect_url: string;
  redirect_code: number;
  page_from_status_code: number;
  first_seen: string;
  prev_seen: string;
  broken_redirect: boolean;
  broken_link_status_code: number;
  domain_from_platform_type: string[];
  domain_from_is_ip: boolean;
  domain_from_ip: string;
  domain_from_country: string;
}

interface BacklinkAnalysisResult {
  domain: string;
  summary: {
    totalBacklinks: number;
    referringDomains: number;
    rank: number;
    spamScore: number;
    newBacklinks: number;
    lostBacklinks: number;
    brokenBacklinks: number;
    nofollowBacklinks: number;
    dofollowBacklinks: number;
  };
  backlinks: BacklinkItem[];
  referringDomains: Array<{
    domain: string;
    backlinks_count: number;
    rank: number;
    is_new: boolean;
    is_lost: boolean;
    country: string;
    tld: string;
    platform_type: string[];
  }>;
  breakdown: {
    byCountry: Array<{ country: string; count: number; percentage: number }>;
    byTLD: Array<{ tld: string; count: number; percentage: number }>;
    byPlatform: Array<{ platform: string; count: number; percentage: number }>;
    byAnchorText: Array<{ anchor: string; count: number; percentage: number }>;
    byFollowType: Array<{ type: 'dofollow' | 'nofollow'; count: number; percentage: number }>;
  };
  topPages: Array<{
    url: string;
    backlinks_count: number;
    referring_domains: number;
    rank: number;
  }>;
  anchors: Array<{
    anchor: string;
    backlinks_count: number;
    referring_domains: number;
    first_seen: string;
    lost_date: string;
    rank: number;
  }>;
  history: Array<{
    date: string;
    backlinks: number;
    referring_domains: number;
    new_backlinks: number;
    lost_backlinks: number;
    new_referring_domains: number;
    lost_referring_domains: number;
  }>;
  competitors: Array<{
    domain: string;
    intersections: number;
    jaccard_index: number;
    rank: number;
    organic_keywords: number;
    organic_traffic: number;
    common_backlinks: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/admin/seo/backlinks]');

    // 1. Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

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

    // 2. Admin verification
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

    // 3. Get request data
    const requestData: BacklinkAnalysisRequest = await request.json();
    const { 
      domain, 
      location_name = 'United States',
      language_name = 'English',
      limit = 1000,
      offset = 0,
      mode = 'live'
    } = requestData;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    console.log('📊 Starting backlink analysis for domain:', domain);
    console.log('🌍 Location settings:', { location_name, language_name });
    console.log('📊 Analysis options:', { limit, offset, mode });

    // 4. Convert language name to code
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

    // 5. Get DataForSEO configuration
    const config = getDataForSEOConfig();
    const auth = Buffer.from(`${config.login}:${config.password}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    const result: BacklinkAnalysisResult = {
      domain,
      summary: {
        totalBacklinks: 0,
        referringDomains: 0,
        rank: 0,
        spamScore: 0,
        newBacklinks: 0,
        lostBacklinks: 0,
        brokenBacklinks: 0,
        nofollowBacklinks: 0,
        dofollowBacklinks: 0,
      },
      backlinks: [],
      referringDomains: [],
      breakdown: {
        byCountry: [],
        byTLD: [],
        byPlatform: [],
        byAnchorText: [],
        byFollowType: [],
      },
      topPages: [],
      anchors: [],
      history: [],
      competitors: [],
    };

    try {
      // 6. Fetch backlinks summary
      console.log('📊 Fetching backlinks summary...');
      const summaryPayload = [{
        target: domain,
      }];

      const summaryResponse = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(summaryPayload),
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        if (summaryData.tasks?.[0]?.result?.[0]) {
          const summary = summaryData.tasks[0].result[0];
          console.log('📊 Summary data:', summary);
          
          result.summary = {
            totalBacklinks: summary.backlinks || 0,
            referringDomains: summary.referring_domains || 0,
            rank: summary.rank || 0,
            spamScore: summary.spam_score || 0,
            newBacklinks: summary.backlinks_new || 0,
            lostBacklinks: summary.backlinks_lost || 0,
            brokenBacklinks: summary.broken_backlinks || 0,
            nofollowBacklinks: summary.backlinks_nofollow || 0,
            dofollowBacklinks: summary.backlinks_dofollow || 0,
          };
        }
      }

      // 7. Fetch detailed backlinks
      console.log('📊 Fetching detailed backlinks...');
      const backlinksPayload = [{
        target: domain,
        limit: limit,
        offset: offset,
        order_by: ['rank,desc'],
        include_subdomains: true,
      }];

      const backlinksResponse = await fetch('https://api.dataforseo.com/v3/backlinks/backlinks/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(backlinksPayload),
      });

      if (backlinksResponse.ok) {
        const backlinksData = await backlinksResponse.json();
        if (backlinksData.tasks?.[0]?.result?.[0]?.items) {
          const items = backlinksData.tasks[0].result[0].items;
          console.log(`📊 Processing ${items.length} backlinks`);
          
          result.backlinks = items.map((item: any) => ({
            domain_from: item.domain_from || '',
            url_from: item.url_from || '',
            domain_to: item.domain_to || '',
            url_to: item.url_to || '',
            tld_from: item.tld_from || '',
            is_new: item.is_new || false,
            is_lost: item.is_lost || false,
            crawl_date: item.crawl_date || '',
            update_date: item.update_date || '',
            page_from_rank: item.page_from_rank || 0,
            domain_from_rank: item.domain_from_rank || 0,
            page_from_external_links: item.page_from_external_links || 0,
            domain_from_external_links: item.domain_from_external_links || 0,
            page_from_internal_links: item.page_from_internal_links || 0,
            domain_from_internal_links: item.domain_from_internal_links || 0,
            page_from_size: item.page_from_size || 0,
            encoding_from: item.encoding_from || '',
            lang_from: item.lang_from || '',
            title_from: item.title_from || '',
            snippet_from: item.snippet_from || '',
            links_count: item.links_count || 0,
            nofollow: item.nofollow || false,
            original: item.original || false,
            alt: item.alt || '',
            anchor: item.anchor || '',
            text_pre: item.text_pre || '',
            text_post: item.text_post || '',
            semantic_location: item.semantic_location || '',
            link_attribute: item.link_attribute || '',
            page_from_scheme: item.page_from_scheme || '',
            redirect: item.redirect || false,
            redirect_url: item.redirect_url || '',
            redirect_code: item.redirect_code || 0,
            page_from_status_code: item.page_from_status_code || 0,
            first_seen: item.first_seen || '',
            prev_seen: item.prev_seen || '',
            broken_redirect: item.broken_redirect || false,
            broken_link_status_code: item.broken_link_status_code || 0,
            domain_from_platform_type: item.domain_from_platform_type || [],
            domain_from_is_ip: item.domain_from_is_ip || false,
            domain_from_ip: item.domain_from_ip || '',
            domain_from_country: item.domain_from_country || '',
          }));

          // 8. Generate breakdown data
          console.log('📊 Generating breakdown analysis...');
          
          // Country breakdown
          const countryCount = new Map<string, number>();
          const tldCount = new Map<string, number>();
          const platformCount = new Map<string, number>();
          const anchorCount = new Map<string, number>();
          const followTypeCount = new Map<string, number>();

          result.backlinks.forEach((backlink) => {
            // Country
            const country = backlink.domain_from_country || 'Unknown';
            countryCount.set(country, (countryCount.get(country) || 0) + 1);

            // TLD
            const tld = backlink.tld_from || 'Unknown';
            tldCount.set(tld, (tldCount.get(tld) || 0) + 1);

            // Platform
            if (backlink.domain_from_platform_type.length > 0) {
              backlink.domain_from_platform_type.forEach(platform => {
                platformCount.set(platform, (platformCount.get(platform) || 0) + 1);
              });
            } else {
              platformCount.set('Unknown', (platformCount.get('Unknown') || 0) + 1);
            }

            // Anchor text
            const anchor = backlink.anchor || 'No anchor text';
            if (anchor.length > 0 && anchor !== 'No anchor text') {
              anchorCount.set(anchor, (anchorCount.get(anchor) || 0) + 1);
            }

            // Follow type
            const followType = backlink.nofollow ? 'nofollow' : 'dofollow';
            followTypeCount.set(followType, (followTypeCount.get(followType) || 0) + 1);
          });

          const total = result.backlinks.length;

          // Convert to arrays and sort
          result.breakdown.byCountry = Array.from(countryCount.entries())
            .map(([country, count]) => ({
              country,
              count,
              percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          result.breakdown.byTLD = Array.from(tldCount.entries())
            .map(([tld, count]) => ({
              tld,
              count,
              percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          result.breakdown.byPlatform = Array.from(platformCount.entries())
            .map(([platform, count]) => ({
              platform,
              count,
              percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          result.breakdown.byAnchorText = Array.from(anchorCount.entries())
            .map(([anchor, count]) => ({
              anchor,
              count,
              percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

          result.breakdown.byFollowType = Array.from(followTypeCount.entries())
            .map(([type, count]) => ({
              type: type as 'dofollow' | 'nofollow',
              count,
              percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count);
        }
      }

      // 9. Fetch referring domains
      console.log('📊 Fetching referring domains...');
      const referringDomainsPayload = [{
        target: domain,
        limit: 100,
        order_by: ['backlinks,desc'],
      }];

      const referringDomainsResponse = await fetch('https://api.dataforseo.com/v3/backlinks/referring_domains/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(referringDomainsPayload),
      });

      if (referringDomainsResponse.ok) {
        const referringDomainsData = await referringDomainsResponse.json();
        if (referringDomainsData.tasks?.[0]?.result?.[0]?.items) {
          const items = referringDomainsData.tasks[0].result[0].items;
          console.log(`📊 Processing ${items.length} referring domains`);
          
          result.referringDomains = items.map((item: any) => ({
            domain: item.domain || '',
            backlinks_count: item.backlinks || 0,
            rank: item.rank || 0,
            is_new: item.is_new || false,
            is_lost: item.is_lost || false,
            country: item.country || '',
            tld: item.tld || '',
            platform_type: item.platform_type || [],
          }));
        }
      }

      // 10. Fetch top pages
      console.log('📊 Fetching top pages...');
      const topPagesPayload = [{
        target: domain,
        limit: 50,
        order_by: ['backlinks,desc'],
      }];

      const topPagesResponse = await fetch('https://api.dataforseo.com/v3/backlinks/pages/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(topPagesPayload),
      });

      if (topPagesResponse.ok) {
        const topPagesData = await topPagesResponse.json();
        if (topPagesData.tasks?.[0]?.result?.[0]?.items) {
          const items = topPagesData.tasks[0].result[0].items;
          console.log(`📊 Processing ${items.length} top pages`);
          
          result.topPages = items.map((item: any) => ({
            url: item.page || '',
            backlinks_count: item.backlinks || 0,
            referring_domains: item.referring_domains || 0,
            rank: item.rank || 0,
          }));
        }
      }

      // 11. Fetch anchors
      console.log('📊 Fetching anchor texts...');
      const anchorsPayload = [{
        target: domain,
        limit: 100,
        order_by: ['backlinks,desc'],
      }];

      const anchorsResponse = await fetch('https://api.dataforseo.com/v3/backlinks/anchors/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(anchorsPayload),
      });

      if (anchorsResponse.ok) {
        const anchorsData = await anchorsResponse.json();
        if (anchorsData.tasks?.[0]?.result?.[0]?.items) {
          const items = anchorsData.tasks[0].result[0].items;
          console.log(`📊 Processing ${items.length} anchor texts`);
          
          result.anchors = items.map((item: any) => ({
            anchor: item.anchor || '',
            backlinks_count: item.backlinks || 0,
            referring_domains: item.referring_domains || 0,
            first_seen: item.first_seen || '',
            lost_date: item.lost_date || '',
            rank: item.rank || 0,
          }));
        }
      }

      // 12. Fetch backlink history (last 30 days)
      console.log('📊 Fetching backlink history...');
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const historyPayload = [{
        target: domain,
        date_from: thirtyDaysAgo.toISOString().split('T')[0],
        date_to: today.toISOString().split('T')[0],
      }];

      const historyResponse = await fetch('https://api.dataforseo.com/v3/backlinks/timeseries_summary/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(historyPayload),
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.tasks?.[0]?.result?.[0]?.items) {
          const items = historyData.tasks[0].result[0].items;
          console.log(`📊 Processing ${items.length} historical data points`);
          
          result.history = items.map((item: any) => ({
            date: item.date || '',
            backlinks: item.backlinks || 0,
            referring_domains: item.referring_domains || 0,
            new_backlinks: item.new_backlinks || 0,
            lost_backlinks: item.lost_backlinks || 0,
            new_referring_domains: item.new_referring_domains || 0,
            lost_referring_domains: item.lost_referring_domains || 0,
          }));
        }
      }

      // 13. Fetch competitors
      console.log('📊 Fetching competitors...');
      const competitorsPayload = [{
        target: domain,
        limit: 20,
        order_by: ['intersections,desc'],
      }];

      const competitorsResponse = await fetch('https://api.dataforseo.com/v3/backlinks/competitors/live', {
        method: 'POST',
        headers,
        body: JSON.stringify(competitorsPayload),
      });

      if (competitorsResponse.ok) {
        const competitorsData = await competitorsResponse.json();
        if (competitorsData.tasks?.[0]?.result?.[0]?.items) {
          const items = competitorsData.tasks[0].result[0].items;
          console.log(`📊 Processing ${items.length} competitors`);
          
          result.competitors = items.map((item: any) => ({
            domain: item.target || '',
            intersections: item.intersections || 0,
            jaccard_index: item.jaccard_index || 0,
            rank: item.rank || 0,
            organic_keywords: item.organic_keywords || 0,
            organic_traffic: item.organic_traffic || 0,
            common_backlinks: item.intersections || 0,
          }));
        }
      }

    } catch (apiError) {
      console.error('❌ DataForSEO API error:', apiError);
      return NextResponse.json(
        { error: 'Failed to fetch backlink data from external API' },
        { status: 500 }
      );
    }

    console.log('✅ Backlink analysis completed successfully');
    console.log('📊 Results summary:', {
      totalBacklinks: result.summary.totalBacklinks,
      referringDomains: result.summary.referringDomains,
      detailedBacklinks: result.backlinks.length,
      referringDomainsData: result.referringDomains.length,
      topPages: result.topPages.length,
      anchors: result.anchors.length,
      historyPoints: result.history.length,
      competitors: result.competitors.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 