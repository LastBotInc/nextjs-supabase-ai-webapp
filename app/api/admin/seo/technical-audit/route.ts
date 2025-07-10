import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface TechnicalAuditResult {
  domain: string;
  summary: {
    totalPages: number;
    crawledPages: number;
    errors: number;
    warnings: number;
    notices: number;
    avgPageSize: number;
    avgLoadTime: number;
    duplicatePages: number;
    brokenLinks: number;
    redirects: number;
  };
  pages: Array<{
    url: string;
    status_code: number;
    page_timing: {
      time_to_interactive: number;
      dom_complete: number;
      largest_contentful_paint: number;
      first_input_delay: number;
      cumulative_layout_shift: number;
    };
    page_meta: {
      title: string;
      description: string;
      keywords: string;
      charset: string;
      viewport: string;
      canonical: string;
    };
    content: {
      plain_text_size: number;
      plain_text_rate: number;
      text_to_html_ratio: number;
      description_to_content_consistency: number;
      title_to_content_consistency: number;
      meta_keywords_consistency: number;
    };
    checks: {
      no_content_encoding: boolean;
      high_loading_time: boolean;
      is_redirect: boolean;
      is_4xx_code: boolean;
      is_5xx_code: boolean;
      is_broken: boolean;
      is_www: boolean;
      is_https: boolean;
      is_http: boolean;
      has_html_doctype: boolean;
      has_meta_refresh_redirect: boolean;
      has_render_blocking_resources: boolean;
      is_mobile_friendly: boolean;
      favicon_in_html: boolean;
      favicon_loading_error: boolean;
      has_meta_title: boolean;
      has_meta_description: boolean;
      has_meta_keywords: boolean;
      no_image_alt: boolean;
      no_image_title: boolean;
      no_description: boolean;
      no_title: boolean;
      no_favicon: boolean;
      seo_friendly_url: boolean;
      flash_detected: boolean;
      frame_detected: boolean;
      lorem_ipsum: boolean;
      seo_friendly_url_characters_check: boolean;
      seo_friendly_url_dynamic_check: boolean;
      seo_friendly_url_keywords_check: boolean;
      seo_friendly_url_relative_length_check: boolean;
      recursive_canonical: boolean;
      canonical_chain: boolean;
      canonical_to_redirect: boolean;
      canonical_to_broken: boolean;
      has_links_to_redirects: boolean;
      has_links_to_broken_resources: boolean;
      has_links_to_unavailable_resources: boolean;
      has_duplicate_meta_title: boolean;
      has_duplicate_meta_description: boolean;
      has_duplicate_meta_keywords: boolean;
    };
    total_dom_size: number;
    custom_js_response: any;
    broken_resources: boolean;
    broken_links: boolean;
    duplicate_title: boolean;
    duplicate_description: boolean;
    duplicate_content: boolean;
    click_depth: number;
    size: number;
    encoded_size: number;
    total_transfer_size: number;
    fetch_time: string;
    cache_control: {
      cachable: boolean;
      ttl: number;
    };
    checks_errors: string[];
    checks_warnings: string[];
    checks_notices: string[];
  }>;
  lighthouse: {
    performance: number;
    accessibility: number;
    best_practices: number;
    seo: number;
  };
  resources: Array<{
    meta: {
      title: string;
      charset: string;
      follow: boolean;
      generator: string;
      htmx_version: string;
      viewport: string;
      referrer: string;
    };
    page_timing: {
      time_to_interactive: number;
      dom_complete: number;
      largest_contentful_paint: number;
      first_input_delay: number;
      cumulative_layout_shift: number;
      speed_index: number;
    };
    onpage_score: number;
    total_dom_size: number;
    broken_resources: boolean;
    broken_links: boolean;
    duplicate_title: boolean;
    duplicate_description: boolean;
    duplicate_content: boolean;
  }>;
  issues: Array<{
    type: 'error' | 'warning' | 'notice';
    message: string;
    description: string;
    pages_count: number;
    urls: string[];
  }>;
}

export async function POST(request: Request) {
  try {
    console.log('\n📝 [POST /api/admin/seo/technical-audit]');
    
    // 1. Verify authentication
    console.log('🔑 Creating auth client...');
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

    // 2. Check admin status
    console.log('🔐 Verifying admin status...');
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.error('❌ User is not admin');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin user authenticated:', user.id);

    // 3. Parse request body
    const { domain, location, language, action = 'start' } = await request.json();

    // Handle status check requests
    if (action === 'status') {
      const { taskId } = await request.json();
      return await checkTaskStatus(taskId);
    }

    // Handle start crawl requests
    if (!domain || !location || !language) {
      console.error('❌ Missing required parameters:', { domain, location, language });
      return NextResponse.json(
        { error: 'Missing required parameters: domain, location, language' },
        { status: 400 }
      );
    }

    const limit = 100; // Default crawl limit
    const locationName = location;
    const languageName = language;

    console.log('📊 Technical audit parameters:', {
      domain,
      locationName,
      languageName,
      limit
    });

    // 4. Validate DataForSEO credentials
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      console.error('❌ DataForSEO credentials not configured');
      return NextResponse.json(
        { error: 'DataForSEO credentials not configured' },
        { status: 500 }
      );
    }

    console.log('🔑 DataForSEO credentials configured');

    // 5. Prepare DataForSEO API credentials
    const credentials = Buffer.from(
      `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
    ).toString('base64');

    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };

    // 6. Create OnPage task
    console.log('🚀 Starting OnPage crawl task...');
    const locationCode = languageName.split('-')[0];
    const taskData = [{
      target: domain,
      max_crawl_pages: limit,
      load_resources: true,
      enable_javascript: true,
      enable_browser_rendering: true,
      language_code: locationCode,
      location_code: locationCode === 'en' ? 2840 : 2840 // Default to US for now
    }];

    const crawlResponse = await fetch('https://api.dataforseo.com/v3/on_page/task_post', {
      method: 'POST',
      headers,
      body: JSON.stringify(taskData),
    });

    const crawlData = await crawlResponse.json();
    console.log('📊 Crawl task response:', crawlData);

    if (crawlData.status_code !== 20000 || !crawlData.tasks?.[0]) {
      console.error('❌ Failed to create crawl task:', crawlData);
      return NextResponse.json(
        { error: 'Failed to create crawl task', details: crawlData },
        { status: 500 }
      );
    }

    const taskId = crawlData.tasks[0].id;
    console.log('📊 Crawl task started with ID:', taskId);

    // 7. Return task ID immediately for asynchronous processing
    return NextResponse.json({
      status: 'started',
      taskId,
      message: 'Crawl task started successfully. Use the status endpoint to check progress.',
      estimatedTime: '5-15 minutes'
    });

  } catch (error) {
    console.error('❌ Technical audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function checkTaskStatus(taskId: string) {
  try {
    console.log('🔍 Checking task status for:', taskId);

    const credentials = Buffer.from(
      `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
    ).toString('base64');

    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };

    // Check if task is ready
    const readyResponse = await fetch('https://api.dataforseo.com/v3/on_page/tasks_ready', {
      method: 'GET',
      headers,
    });

    const readyData = await readyResponse.json();
    console.log('📊 Tasks ready response:', readyData);

    const isReady = readyData.tasks?.some((task: any) => task.id === taskId);

    if (!isReady) {
      return NextResponse.json({
        status: 'processing',
        message: 'Crawl task is still in progress'
      });
    }

    // Task is ready, fetch results
    console.log('📊 Task is ready, fetching results...');
    
    const pagesResponse = await fetch(`https://api.dataforseo.com/v3/on_page/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ id: taskId, limit: 1000 }]),
    });

    const pagesData = await pagesResponse.json();
    console.log('📊 Pages data response status:', pagesData.status_code);

    if (pagesData.status_code !== 20000) {
      console.error('❌ Failed to fetch pages data:', pagesData);
      return NextResponse.json({
        status: 'error',
        error: 'Failed to fetch crawl results',
        details: pagesData
      }, { status: 500 });
    }

    const pages = pagesData.tasks?.[0]?.result || [];
    console.log('📊 Crawled pages count:', pages.length);

    // Process results
    const result = await processAuditResults(pages, taskId, headers);
    
    return NextResponse.json({
      status: 'completed',
      data: result
    });

  } catch (error) {
    console.error('❌ Error checking task status:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to check task status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function processAuditResults(pages: any[], taskId: string, headers: any): Promise<TechnicalAuditResult> {
  console.log('📊 Processing audit results...');

  // Initialize result object
  const result: TechnicalAuditResult = {
    domain: pages[0]?.domain || '',
    summary: {
      totalPages: 0,
      crawledPages: 0,
      errors: 0,
      warnings: 0,
      notices: 0,
      avgPageSize: 0,
      avgLoadTime: 0,
      duplicatePages: 0,
      brokenLinks: 0,
      redirects: 0,
    },
    pages: [],
    lighthouse: {
      performance: 0,
      accessibility: 0,
      best_practices: 0,
      seo: 0,
    },
    resources: [],
    issues: [],
  };

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalNotices = 0;
  let totalSize = 0;
  let totalLoadTime = 0;
  let duplicatePages = 0;
  let brokenLinksCount = 0;
  let redirectsCount = 0;

  result.pages = pages.map((page: any) => {
    // Count issues
    const errorCount = (page.checks_errors?.length || 0);
    const warningCount = (page.checks_warnings?.length || 0);
    const noticeCount = (page.checks_notices?.length || 0);

    totalErrors += errorCount;
    totalWarnings += warningCount;
    totalNotices += noticeCount;
    totalSize += page.size || 0;
    totalLoadTime += page.page_timing?.time_to_interactive || 0;

    if (page.duplicate_content) duplicatePages++;
    if (page.broken_links) brokenLinksCount++;
    if (page.checks?.is_redirect) redirectsCount++;

    return {
      url: page.url || '',
      status_code: page.status_code || 0,
      page_timing: {
        time_to_interactive: page.page_timing?.time_to_interactive || 0,
        dom_complete: page.page_timing?.dom_complete || 0,
        largest_contentful_paint: page.page_timing?.largest_contentful_paint || 0,
        first_input_delay: page.page_timing?.first_input_delay || 0,
        cumulative_layout_shift: page.page_timing?.cumulative_layout_shift || 0,
      },
      page_meta: {
        title: page.page_meta?.title || '',
        description: page.page_meta?.description || '',
        keywords: page.page_meta?.keywords || '',
        charset: page.page_meta?.charset || '',
        viewport: page.page_meta?.viewport || '',
        canonical: page.page_meta?.canonical || '',
      },
      content: {
        plain_text_size: page.content?.plain_text_size || 0,
        plain_text_rate: page.content?.plain_text_rate || 0,
        text_to_html_ratio: page.content?.text_to_html_ratio || 0,
        description_to_content_consistency: page.content?.description_to_content_consistency || 0,
        title_to_content_consistency: page.content?.title_to_content_consistency || 0,
        meta_keywords_consistency: page.content?.meta_keywords_consistency || 0,
      },
      checks: page.checks || {},
      total_dom_size: page.total_dom_size || 0,
      custom_js_response: page.custom_js_response,
      broken_resources: page.broken_resources || false,
      broken_links: page.broken_links || false,
      duplicate_title: page.duplicate_title || false,
      duplicate_description: page.duplicate_description || false,
      duplicate_content: page.duplicate_content || false,
      click_depth: page.click_depth || 0,
      size: page.size || 0,
      encoded_size: page.encoded_size || 0,
      total_transfer_size: page.total_transfer_size || 0,
      fetch_time: page.fetch_time || '',
      cache_control: {
        cachable: page.cache_control?.cachable || false,
        ttl: page.cache_control?.ttl || 0,
      },
      checks_errors: page.checks_errors || [],
      checks_warnings: page.checks_warnings || [],
      checks_notices: page.checks_notices || [],
    };
  });

  // Calculate summary statistics
  const pageCount = result.pages.length;
  result.summary = {
    totalPages: pageCount,
    crawledPages: pageCount,
    errors: totalErrors,
    warnings: totalWarnings,
    notices: totalNotices,
    avgPageSize: pageCount > 0 ? Math.round(totalSize / pageCount) : 0,
    avgLoadTime: pageCount > 0 ? Math.round(totalLoadTime / pageCount) : 0,
    duplicatePages,
    brokenLinks: brokenLinksCount,
    redirects: redirectsCount,
  };

  // Get Lighthouse data if we have pages
  if (pages.length > 0) {
    try {
      console.log('📊 Fetching Lighthouse data...');
      const firstPageUrl = pages[0].url;
      const lighthouseResponse = await fetch('https://api.dataforseo.com/v3/on_page/lighthouse/live/json', {
        method: 'POST',
        headers,
        body: JSON.stringify([{ 
          url: firstPageUrl,
          device: 'desktop',
          audits: true
        }]),
      });

      if (lighthouseResponse.ok) {
        const lighthouseData = await lighthouseResponse.json();
        if (lighthouseData.tasks?.[0]?.result?.[0]) {
          const lighthouse = lighthouseData.tasks[0].result[0];
          console.log('📊 Processing Lighthouse data');

          result.lighthouse = {
            performance: Math.round((lighthouse.categories?.performance?.score || 0) * 100),
            accessibility: Math.round((lighthouse.categories?.accessibility?.score || 0) * 100),
            best_practices: Math.round((lighthouse.categories?.['best-practices']?.score || 0) * 100),
            seo: Math.round((lighthouse.categories?.seo?.score || 0) * 100),
          };
        }
      }
    } catch (lighthouseError) {
      console.error('❌ Error fetching Lighthouse data:', lighthouseError);
      // Continue without Lighthouse data
    }
  }

  // Generate issues summary
  console.log('📊 Generating issues summary...');
  const issuesMap = new Map<string, { type: 'error' | 'warning' | 'notice'; pages: string[]; description: string }>();

  result.pages.forEach(page => {
    // Process errors
    page.checks_errors.forEach(error => {
      if (!issuesMap.has(error)) {
        issuesMap.set(error, { type: 'error', pages: [], description: error });
      }
      issuesMap.get(error)!.pages.push(page.url);
    });

    // Process warnings
    page.checks_warnings.forEach(warning => {
      if (!issuesMap.has(warning)) {
        issuesMap.set(warning, { type: 'warning', pages: [], description: warning });
      }
      issuesMap.get(warning)!.pages.push(page.url);
    });

    // Process notices
    page.checks_notices.forEach(notice => {
      if (!issuesMap.has(notice)) {
        issuesMap.set(notice, { type: 'notice', pages: [], description: notice });
      }
      issuesMap.get(notice)!.pages.push(page.url);
    });
  });

  result.issues = Array.from(issuesMap.entries()).map(([message, data]) => ({
    type: data.type,
    message,
    description: data.description,
    pages_count: data.pages.length,
    urls: data.pages.slice(0, 10), // Limit to first 10 URLs
  }));

  console.log('📊 Results summary:', {
    totalPages: result.summary.totalPages,
    errors: result.summary.errors,
    warnings: result.summary.warnings,
    notices: result.summary.notices,
    lighthousePerformance: result.lighthouse.performance,
    lighthouseSEO: result.lighthouse.seo,
    issuesCount: result.issues.length
  });

  return result;
} 