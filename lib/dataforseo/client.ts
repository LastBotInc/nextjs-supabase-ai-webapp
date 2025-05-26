import { 
  DataForSEOConfig, 
  DataForSEOResponse, 
  DataForSEOTaskResponse,
  SERPTaskRequest,
  SERPResult,
  KeywordDataRequest,
  KeywordDataResult,
  BacklinksRequest,
  BacklinkResult,
  OnPageRequest,
  OnPageResult,
  ContentAnalysisRequest,
  ContentAnalysisResult
} from '@/types/seo';

/**
 * Rate limiter class to handle API rate limiting
 */
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number = 60000; // 1 minute in milliseconds

  constructor(maxRequestsPerMinute: number) {
    this.maxRequests = maxRequestsPerMinute;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    // If we're at the limit, wait until we can make another request
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest) + 100; // Add 100ms buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.wait(); // Recursive call to check again
      }
    }
    
    // Record this request
    this.requests.push(now);
  }
}

/**
 * Main DataForSEO API client
 */
export class DataForSEOClient {
  private config: DataForSEOConfig;
  private rateLimiter: RateLimiter;
  private baseUrl: string;

  constructor(config: DataForSEOConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.baseUrl = config.apiUrl;
  }

  /**
   * Make a request to the DataForSEO API
   */
  private async makeRequest<T = any>(
    endpoint: string, 
    data?: any, 
    method: 'GET' | 'POST' = 'POST'
  ): Promise<DataForSEOResponse<T>> {
    await this.rateLimiter.wait();
    
    const url = `${this.baseUrl}${endpoint}`;
    const authHeader = Buffer.from(`${this.config.login}:${this.config.password}`).toString('base64');
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: method === 'POST' && data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as DataForSEOResponse<T>;
      
      if (result.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${result.status_message}`);
      }

      return result;
    } catch (error) {
      console.error('DataForSEO API request failed:', error);
      throw error;
    }
  }

  /**
   * Get available locations for SERP API
   */
  async getLocations(): Promise<DataForSEOResponse> {
    return this.makeRequest('/serp/google/locations', undefined, 'GET');
  }

  /**
   * Get available languages for SERP API
   */
  async getLanguages(): Promise<DataForSEOResponse> {
    return this.makeRequest('/serp/google/languages', undefined, 'GET');
  }

  // SERP API Methods
  
  /**
   * Post SERP task for organic search results
   */
  async postSERPTask(tasks: SERPTaskRequest[]): Promise<DataForSEOResponse> {
    return this.makeRequest('/serp/google/organic/task_post', tasks);
  }

  /**
   * Get SERP task results
   */
  async getSERPResults(taskId: string): Promise<DataForSEOResponse<SERPResult>> {
    return this.makeRequest(`/serp/google/organic/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get live SERP results (more expensive but immediate)
   */
  async getLiveSERPResults(task: SERPTaskRequest): Promise<DataForSEOResponse<SERPResult>> {
    return this.makeRequest('/serp/google/organic/live', [task]);
  }

  /**
   * Post SERP task for Google Maps results
   */
  async postSERPMapsTask(tasks: SERPTaskRequest[]): Promise<DataForSEOResponse> {
    return this.makeRequest('/serp/google/maps/task_post', tasks);
  }

  /**
   * Get SERP Maps task results
   */
  async getSERPMapsResults(taskId: string): Promise<DataForSEOResponse> {
    return this.makeRequest(`/serp/google/maps/task_get/${taskId}`, undefined, 'GET');
  }

  // Keywords Data API Methods
  
  /**
   * Post keyword data task
   */
  async postKeywordDataTask(tasks: KeywordDataRequest[]): Promise<DataForSEOResponse> {
    return this.makeRequest('/keywords_data/google_ads/search_volume/task_post', tasks);
  }

  /**
   * Get keyword data results
   */
  async getKeywordDataResults(taskId: string): Promise<DataForSEOResponse<KeywordDataResult>> {
    return this.makeRequest(`/keywords_data/google_ads/search_volume/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get live keyword data (more expensive but immediate)
   */
  async getLiveKeywordData(task: KeywordDataRequest): Promise<DataForSEOResponse<KeywordDataResult>> {
    return this.makeRequest('/keywords_data/google_ads/search_volume/live', [task]);
  }

  /**
   * Get keyword suggestions
   */
  async getKeywordSuggestions(keyword: string, locationCode?: number, languageCode?: string): Promise<DataForSEOResponse> {
    const task = {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
    };
    return this.makeRequest('/keywords_data/google_ads/keywords_for_keywords/live', [task]);
  }

  /**
   * Get keyword ideas
   */
  async getKeywordIdeas(keyword: string, locationCode?: number, languageCode?: string): Promise<DataForSEOResponse> {
    const task = {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
    };
    return this.makeRequest('/keywords_data/google_ads/ad_traffic_by_keywords/live', [task]);
  }

  // DataForSEO Labs API Methods
  
  /**
   * Get keyword difficulty
   */
  async getKeywordDifficulty(keywords: string[], locationCode?: number, languageCode?: string): Promise<DataForSEOResponse> {
    const task = {
      keywords,
      location_code: locationCode,
      language_code: languageCode,
    };
    return this.makeRequest('/dataforseo_labs/google/keyword_difficulty/live', [task]);
  }

  /**
   * Get SERP competitors
   */
  async getSERPCompetitors(keyword: string, locationCode?: number, languageCode?: string): Promise<DataForSEOResponse> {
    const task = {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
    };
    return this.makeRequest('/dataforseo_labs/google/serp_competitors/live', [task]);
  }

  /**
   * Get domain competitors
   */
  async getDomainCompetitors(target: string, locationCode?: number, languageCode?: string): Promise<DataForSEOResponse> {
    const task = {
      target,
      location_code: locationCode,
      language_code: languageCode,
    };
    return this.makeRequest('/dataforseo_labs/google/domain_competitors/live', [task]);
  }

  // Backlinks API Methods
  
  /**
   * Post backlinks task
   */
  async postBacklinksTask(tasks: BacklinksRequest[]): Promise<DataForSEOResponse> {
    return this.makeRequest('/backlinks/backlinks/task_post', tasks);
  }

  /**
   * Get backlinks results
   */
  async getBacklinksResults(taskId: string): Promise<DataForSEOResponse<BacklinkResult>> {
    return this.makeRequest(`/backlinks/backlinks/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get live backlinks data
   */
  async getLiveBacklinks(task: BacklinksRequest): Promise<DataForSEOResponse<BacklinkResult>> {
    return this.makeRequest('/backlinks/backlinks/live', [task]);
  }

  /**
   * Get referring domains
   */
  async getReferringDomains(target: string, limit?: number): Promise<DataForSEOResponse> {
    const task = {
      target,
      limit: limit || 100,
    };
    return this.makeRequest('/backlinks/referring_domains/live', [task]);
  }

  /**
   * Get domain intersection (common backlinks between domains)
   */
  async getDomainIntersection(targets: string[], limit?: number): Promise<DataForSEOResponse> {
    const task = {
      targets,
      limit: limit || 100,
    };
    return this.makeRequest('/backlinks/domain_intersection/live', [task]);
  }

  // OnPage API Methods
  
  /**
   * Post OnPage task
   */
  async postOnPageTask(tasks: OnPageRequest[]): Promise<DataForSEOResponse> {
    return this.makeRequest('/on_page/task_post', tasks);
  }

  /**
   * Get OnPage results
   */
  async getOnPageResults(taskId: string): Promise<DataForSEOResponse<OnPageResult>> {
    return this.makeRequest(`/on_page/pages/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get OnPage summary
   */
  async getOnPageSummary(taskId: string): Promise<DataForSEOResponse> {
    return this.makeRequest(`/on_page/summary/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get OnPage issues
   */
  async getOnPageIssues(taskId: string): Promise<DataForSEOResponse> {
    return this.makeRequest(`/on_page/pages/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get page speed insights
   */
  async getPageSpeedInsights(url: string, device?: 'desktop' | 'mobile'): Promise<DataForSEOResponse> {
    const task = {
      url,
      device: device || 'desktop',
    };
    return this.makeRequest('/on_page/lighthouse/live', [task]);
  }

  // Content Analysis API Methods
  
  /**
   * Post content analysis task
   */
  async postContentAnalysisTask(tasks: ContentAnalysisRequest[]): Promise<DataForSEOResponse> {
    return this.makeRequest('/content_analysis/search/live', tasks);
  }

  /**
   * Get content analysis results
   */
  async getContentAnalysisResults(taskId: string): Promise<DataForSEOResponse<ContentAnalysisResult>> {
    return this.makeRequest(`/content_analysis/search/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get live content analysis
   */
  async getLiveContentAnalysis(task: ContentAnalysisRequest): Promise<DataForSEOResponse<ContentAnalysisResult>> {
    return this.makeRequest('/content_analysis/search/live', [task]);
  }

  /**
   * Get sentiment analysis
   */
  async getSentimentAnalysis(text: string, language?: string): Promise<DataForSEOResponse> {
    const task = {
      text,
      language: language || 'en',
    };
    return this.makeRequest('/content_analysis/sentiment_analysis/live', [task]);
  }

  /**
   * Get content generation
   */
  async generateContent(prompt: string, type?: string, language?: string): Promise<DataForSEOResponse> {
    const task = {
      prompt,
      type: type || 'article',
      language: language || 'en',
    };
    return this.makeRequest('/content_generation/generate/live', [task]);
  }

  // Domain Analytics API Methods
  
  /**
   * Get domain technologies
   */
  async getDomainTechnologies(domain: string): Promise<DataForSEOResponse> {
    const task = { target: domain };
    return this.makeRequest('/domain_analytics/technologies/domain_technologies/live', [task]);
  }

  /**
   * Get domain whois data
   */
  async getDomainWhois(domain: string): Promise<DataForSEOResponse> {
    const task = { target: domain };
    return this.makeRequest('/domain_analytics/whois/overview/live', [task]);
  }

  // Merchant API Methods (for e-commerce)
  
  /**
   * Get Google Shopping results
   */
  async getGoogleShoppingResults(keyword: string, locationCode?: number): Promise<DataForSEOResponse> {
    const task = {
      keyword,
      location_code: locationCode,
    };
    return this.makeRequest('/merchant/google/product_info/live', [task]);
  }

  /**
   * Get Amazon product data
   */
  async getAmazonProductData(keyword: string, locationCode?: number): Promise<DataForSEOResponse> {
    const task = {
      keyword,
      location_code: locationCode,
    };
    return this.makeRequest('/merchant/amazon/products/live', [task]);
  }

  // App Data API Methods
  
  /**
   * Get App Store app data
   */
  async getAppStoreData(appId: string): Promise<DataForSEOResponse> {
    const task = { app_id: appId };
    return this.makeRequest('/app_data/apple/app_info/live', [task]);
  }

  /**
   * Get Google Play app data
   */
  async getGooglePlayData(appId: string): Promise<DataForSEOResponse> {
    const task = { app_id: appId };
    return this.makeRequest('/app_data/google/app_info/live', [task]);
  }

  // Business Data API Methods
  
  /**
   * Get Google My Business data
   */
  async getGoogleMyBusinessData(keyword: string, locationCode?: number): Promise<DataForSEOResponse> {
    const task = {
      keyword,
      location_code: locationCode,
    };
    return this.makeRequest('/business_data/google/my_business/live', [task]);
  }

  /**
   * Get business reviews
   */
  async getBusinessReviews(businessId: string): Promise<DataForSEOResponse> {
    const task = { business_id: businessId };
    return this.makeRequest('/business_data/google/reviews/live', [task]);
  }

  // Utility Methods
  
  /**
   * Get user data (account info, usage, etc.)
   */
  async getUserData(): Promise<DataForSEOResponse> {
    return this.makeRequest('/appendix/user_data', undefined, 'GET');
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(): Promise<DataForSEOResponse> {
    return this.makeRequest('/appendix/user_data', undefined, 'GET');
  }

  /**
   * Get available endpoints
   */
  async getAvailableEndpoints(): Promise<DataForSEOResponse> {
    return this.makeRequest('/appendix/endpoints', undefined, 'GET');
  }

  /**
   * Check task status
   */
  async checkTaskStatus(taskId: string, endpoint: string): Promise<DataForSEOResponse> {
    return this.makeRequest(`${endpoint}/task_get/${taskId}`, undefined, 'GET');
  }

  /**
   * Get all ready tasks
   */
  async getReadyTasks(endpoint: string): Promise<DataForSEOResponse> {
    return this.makeRequest(`${endpoint}/tasks_ready`, undefined, 'GET');
  }
}

/**
 * Create a DataForSEO client instance with environment configuration
 */
export function createDataForSEOClient(): DataForSEOClient {
  const config: DataForSEOConfig = {
    login: process.env.DATAFORSEO_LOGIN || '',
    password: process.env.DATAFORSEO_PASSWORD || '',
    apiUrl: process.env.DATAFORSEO_API_URL || 'https://api.dataforseo.com/v3',
    rateLimit: parseInt(process.env.DATAFORSEO_RATE_LIMIT || '2000'),
  };

  if (!config.login || !config.password) {
    throw new Error('DataForSEO credentials not configured. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.');
  }

  return new DataForSEOClient(config);
}

export default DataForSEOClient; 