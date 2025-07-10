// SEO Integration Types
// Types for DataForSEO API integration and SEO data models

export interface SEOProject {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  description?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SERPTracking {
  id: string;
  project_id: string;
  keyword: string;
  location_code?: number;
  language_code?: string;
  search_engine: string;
  current_position?: number;
  previous_position?: number;
  url?: string;
  title?: string;
  description?: string;
  serp_features: string[];
  tracked_at: string;
  created_at: string;
}

export interface KeywordResearch {
  id: string;
  project_id: string;
  keyword: string;
  search_volume?: number;
  cpc?: number;
  competition?: number;
  difficulty?: number;
  search_intent?: string;
  related_keywords: string[];
  trends_data: Record<string, any>;
  created_at: string;
}

export interface BacklinkAnalysis {
  id: string;
  project_id: string;
  target_url: string;
  referring_domain?: string;
  referring_url?: string;
  anchor_text?: string;
  link_type?: string;
  dofollow?: boolean;
  first_seen?: string;
  last_seen?: string;
  domain_rank?: number;
  page_rank?: number;
  created_at: string;
}

export interface TechnicalAudit {
  id: string;
  project_id: string;
  url: string;
  status_code?: number;
  page_title?: string;
  meta_description?: string;
  h1_tags: string[];
  issues: TechnicalIssue[];
  performance_score?: number;
  accessibility_score?: number;
  seo_score?: number;
  audit_date: string;
  created_at: string;
}

export interface TechnicalIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  element?: string;
  recommendation?: string;
}

export interface ContentAnalysis {
  id: string;
  project_id: string;
  content_type?: string;
  query?: string;
  mentions_count?: number;
  sentiment_score?: number;
  sentiment_label?: string;
  top_mentions: ContentMention[];
  trends_data: Record<string, any>;
  analyzed_at: string;
  created_at: string;
}

export interface ContentMention {
  source: string;
  url: string;
  title: string;
  snippet: string;
  sentiment: string;
  date: string;
}

export interface DataForSEOTask {
  id: string;
  project_id: string;
  task_id: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface SEOReport {
  id: string;
  project_id: string;
  report_type: string;
  report_name: string;
  report_data?: Record<string, any>;
  generated_at: string;
  created_at: string;
}

// DataForSEO API Types
export interface DataForSEOConfig {
  login: string;
  password: string;
  apiUrl: string;
  rateLimit: number;
}

export interface DataForSEOResponse<T = any> {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: DataForSEOTaskResponse<T>[];
}

export interface DataForSEOTaskResponse<T = any> {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: any;
  result?: T[];
}

// SERP API Types
export interface SERPTaskRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
  device?: 'desktop' | 'mobile';
  os?: 'windows' | 'macos' | 'android' | 'ios';
  se_domain?: string;
  depth?: number;
  max_crawl_pages?: number;
  search_param?: string;
  tag?: string;
}

export interface SERPResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  spell?: SpellResult;
  refinement_chips?: RefinementChip[];
  item_types: string[];
  se_results_count: number;
  items_count: number;
  items: SERPItem[];
}

export interface SERPItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  xpath: string;
  domain: string;
  title: string;
  url: string;
  breadcrumb?: string;
  website_name?: string;
  description?: string;
  highlighted?: string[];
  extra?: Record<string, any>;
  about_this_result?: AboutThisResult;
  related_search_url?: string;
  timestamp?: string;
  rectangle?: Rectangle;
}

export interface SpellResult {
  keyword: string;
  type: string;
}

export interface RefinementChip {
  type: string;
  title: string;
  url: string;
  domain: string;
  options: RefinementOption[];
}

export interface RefinementOption {
  type: string;
  title: string;
  url: string;
  domain: string;
}

export interface AboutThisResult {
  type: string;
  url: string;
  source: string;
  source_info: string;
  source_url: string;
  language: string;
  location: string;
  search_terms: string[];
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Keywords Data API Types
export interface KeywordDataRequest {
  keywords: string[];
  location_code?: number;
  language_code?: string;
  search_partners?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  tag?: string;
}

export interface KeywordDataResult {
  keyword: string;
  location_code: number;
  language_code: string;
  search_partners: boolean;
  competition: number;
  competition_level: string;
  cpc: number;
  search_volume: number;
  low_top_of_page_bid: number;
  high_top_of_page_bid: number;
  categories: number[];
  monthly_searches: MonthlySearch[];
}

export interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

// Backlinks API Types
export interface BacklinksRequest {
  target: string;
  mode?: 'as_is' | 'one_per_domain' | 'one_per_anchor';
  filters?: BacklinkFilter[];
  order_by?: string[];
  limit?: number;
  offset?: number;
  tag?: string;
}

export interface BacklinkFilter {
  field: string;
  operator: string;
  value: any;
}

export interface BacklinkResult {
  target: string;
  total_count: number;
  items_count: number;
  items: BacklinkItem[];
}

export interface BacklinkItem {
  type: string;
  domain_from: string;
  url_from: string;
  domain_to: string;
  url_to: string;
  tld_from: string;
  is_new: boolean;
  is_lost: boolean;
  crawl_progress: string;
  crawl_status: CrawlStatus;
  is_broken: boolean;
  url_from_status_code: number;
  url_to_status_code: number;
  item_type: string;
  direction: string;
  is_indirect: boolean;
  anchor: string;
  text_pre: string;
  text_post: string;
  semantic_location: string;
  links_count: number;
  nofollow: boolean;
  original: boolean;
  alt: string;
  image_url: string;
  anchor_url: string;
  normalized_anchor: string;
  first_seen: string;
  prev_seen: string;
  last_seen: string;
  item_attributes: Record<string, any>;
  rank: number;
  page_from_rank: number;
  domain_from_rank: number;
  domain_from_platform_type: string[];
  domain_from_is_ip: boolean;
  domain_from_ip: string;
  domain_from_country: string;
  page_from_external_links: number;
  page_from_internal_links: number;
  page_from_size: number;
  page_from_encoding: string;
  page_from_language: string;
  page_from_title: string;
  page_from_meta_description: string;
  page_from_meta_keywords: string;
  page_from_content: string;
  page_from_last_modified: string;
}

export interface CrawlStatus {
  max_crawl_pages: number;
  pages_in_queue: number;
  pages_crawled: number;
}

// OnPage API Types
export interface OnPageRequest {
  target: string;
  max_crawl_pages?: number;
  start_url?: string;
  boundary?: string;
  filters?: OnPageFilter[];
  tag?: string;
}

export interface OnPageFilter {
  field: string;
  operator: string;
  value: any;
}

export interface OnPageResult {
  crawl_progress: string;
  crawl_status: CrawlStatus;
  total_items_count: number;
  items_count: number;
  items: OnPageItem[];
}

export interface OnPageItem {
  type: string;
  status_code: number;
  location: string;
  url: string;
  meta: OnPageMeta;
  page_timing: PageTiming;
  onpage_score: number;
  total_dom_size: number;
  custom_js_response?: any;
  resource_errors?: ResourceError[];
  page_metrics: PageMetrics;
  content: OnPageContent;
  links: OnPageLinks;
  images: OnPageImages;
  videos: OnPageVideos;
  audits: OnPageAudits;
}

export interface OnPageMeta {
  title: string;
  charset: string;
  follow: boolean;
  generator: string;
  htlang: string;
  description: string;
  favicon: string;
  meta_keywords: string;
  canonical: string;
  internal_links_count: number;
  external_links_count: number;
  inbound_links_count: number;
  images_count: number;
  images_size: number;
  scripts_count: number;
  scripts_size: number;
  stylesheets_count: number;
  stylesheets_size: number;
  title_length: number;
  description_length: number;
  render_blocking_scripts_count: number;
  render_blocking_stylesheets_count: number;
  cumulative_layout_shift: number;
  meta_title: string;
  content: string;
  deprecated_tags: string[];
  duplicate_meta_tags: string[];
  spell_errors: SpellError[];
  social_media_tags: SocialMediaTag[];
}

export interface PageTiming {
  time_to_interactive: number;
  dom_content_loaded: number;
  connection_time: number;
  time_to_secure_connection: number;
  request_sent_time: number;
  waiting_time: number;
  download_time: number;
  duration_time: number;
  fetch_start: number;
  fetch_end: number;
}

export interface ResourceError {
  url: string;
  status_code: number;
  type: string;
  size: number;
}

export interface PageMetrics {
  first_contentful_paint: number;
  largest_contentful_paint: number;
  first_input_delay: number;
  cumulative_layout_shift: number;
  speed_index: number;
  total_blocking_time: number;
  time_to_interactive: number;
}

export interface OnPageContent {
  plain_text_size: number;
  plain_text_rate: number;
  plain_text_word_count: number;
  automated_readability_index: number;
  coleman_liau_readability_index: number;
  dale_chall_readability_index: number;
  flesch_kincaid_readability_index: number;
  smog_readability_index: number;
  description_to_content_consistency: number;
  title_to_content_consistency: number;
  meta_keywords_to_content_consistency: number;
}

export interface OnPageLinks {
  internal: OnPageLink[];
  external: OnPageLink[];
}

export interface OnPageLink {
  type: string;
  domain_from: string;
  domain_to: string;
  page_from: string;
  page_to: string;
  link_from: string;
  link_to: string;
  dofollow: boolean;
  page_from_scheme: string;
  page_to_scheme: string;
  direction: string;
  is_broken: boolean;
  is_redirect: boolean;
  is_indirect: boolean;
  anchor: string;
  text_pre: string;
  text_post: string;
  url_from_status_code: number;
  url_to_status_code: number;
}

export interface OnPageImages {
  total_count: number;
  total_size: number;
  items: OnPageImage[];
}

export interface OnPageImage {
  type: string;
  status_code: number;
  url: string;
  size: number;
  encoded_size: number;
  width: number;
  height: number;
  mime_type: string;
  alt: string;
  title: string;
  anchor: string;
  text_pre: string;
  text_post: string;
}

export interface OnPageVideos {
  total_count: number;
  items: OnPageVideo[];
}

export interface OnPageVideo {
  type: string;
  url: string;
  duration: number;
  width: number;
  height: number;
  poster: string;
  title: string;
}

export interface OnPageAudits {
  lighthouse: LighthouseAudit;
  page_speed_insights: PageSpeedInsightsAudit;
}

export interface LighthouseAudit {
  version: string;
  categories: LighthouseCategory[];
  audits: LighthouseAuditItem[];
}

export interface LighthouseCategory {
  id: string;
  title: string;
  description: string;
  score: number;
  manual_description: string;
  audit_refs: LighthouseAuditRef[];
}

export interface LighthouseAuditRef {
  id: string;
  weight: number;
  group: string;
  acronym: string;
}

export interface LighthouseAuditItem {
  id: string;
  title: string;
  description: string;
  score: number;
  score_display_mode: string;
  display_value: string;
  explanation: string;
  error_message: string;
  warnings: string[];
  details: Record<string, any>;
}

export interface PageSpeedInsightsAudit {
  version: string;
  categories: PageSpeedCategory[];
  audits: PageSpeedAuditItem[];
}

export interface PageSpeedCategory {
  id: string;
  title: string;
  score: number;
  audit_refs: PageSpeedAuditRef[];
}

export interface PageSpeedAuditRef {
  id: string;
  weight: number;
  group: string;
}

export interface PageSpeedAuditItem {
  id: string;
  title: string;
  description: string;
  score: number;
  score_display_mode: string;
  display_value: string;
  explanation: string;
  details: Record<string, any>;
}

export interface SpellError {
  type: string;
  title: string;
  description: string;
  negative_factor: number;
}

export interface SocialMediaTag {
  type: string;
  title: string;
  description: string;
  image: string;
  url: string;
}

// Content Analysis API Types
export interface ContentAnalysisRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
  device?: 'desktop' | 'mobile';
  depth?: number;
  filters?: ContentAnalysisFilter[];
  tag?: string;
}

export interface ContentAnalysisFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ContentAnalysisResult {
  keyword: string;
  type: string;
  location_code: number;
  language_code: string;
  total_count: number;
  items_count: number;
  items: ContentAnalysisItem[];
}

export interface ContentAnalysisItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  domain: string;
  title: string;
  url: string;
  snippet: string;
  content_score: number;
  meta_description: string;
  meta_keywords: string[];
  word_count: number;
  character_count: number;
  page_category: string[];
  page_types: string[];
  sentiment_connotations: SentimentConnotation;
  connotation_types: ConnotationType;
  text_categories: TextCategory[];
  language: string;
  detected_language: string;
  spell_errors: SpellError[];
  content_quality_score: number;
  machine_readable_info: MachineReadableInfo;
  content_structure: ContentStructure;
}

export interface SentimentConnotation {
  anger: number;
  happiness: number;
  love: number;
  sadness: number;
  share: number;
  fun: number;
}

export interface ConnotationType {
  positive: number;
  negative: number;
  neutral: number;
}

export interface TextCategory {
  category: string;
  confidence_level: number;
}

export interface MachineReadableInfo {
  schema_org: SchemaOrgInfo[];
  microformats: MicroformatInfo[];
  open_graph: OpenGraphInfo;
  twitter_card: TwitterCardInfo;
  json_ld: JsonLdInfo[];
}

export interface SchemaOrgInfo {
  type: string;
  properties: Record<string, any>;
}

export interface MicroformatInfo {
  type: string;
  properties: Record<string, any>;
}

export interface OpenGraphInfo {
  type: string;
  title: string;
  description: string;
  image: string;
  url: string;
  site_name: string;
  locale: string;
}

export interface TwitterCardInfo {
  type: string;
  title: string;
  description: string;
  image: string;
  site: string;
  creator: string;
}

export interface JsonLdInfo {
  type: string;
  properties: Record<string, any>;
}

export interface ContentStructure {
  h1_tags: string[];
  h2_tags: string[];
  h3_tags: string[];
  h4_tags: string[];
  h5_tags: string[];
  h6_tags: string[];
  images_count: number;
  videos_count: number;
  links_count: number;
  lists_count: number;
  tables_count: number;
}

// API Request/Response wrapper types
export interface SEOApiRequest<T = any> {
  endpoint: string;
  method: 'GET' | 'POST';
  data?: T;
  projectId?: string;
}

export interface SEOApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  cost?: number;
  taskId?: string;
}

// Dashboard and UI types
export interface SEODashboardData {
  projects: SEOProject[];
  recentActivity: SEOActivity[];
  keyMetrics: SEOMetrics;
  alerts: SEOAlert[];
}

export interface SEOActivity {
  id: string;
  type: 'rank_change' | 'new_backlink' | 'technical_issue' | 'content_mention';
  project_id: string;
  project_name: string;
  title: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface SEOMetrics {
  totalProjects: number;
  totalKeywords: number;
  averagePosition: number;
  totalBacklinks: number;
  technicalIssues: number;
  contentMentions: number;
}

export interface SEOAlert {
  id: string;
  type: 'ranking_drop' | 'technical_error' | 'api_limit' | 'new_opportunity';
  project_id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  read: boolean;
}

// Form types for creating/editing
export interface CreateSEOProjectForm {
  name: string;
  domain: string;
  description?: string;
  settings?: {
    trackingKeywords?: string[];
    competitors?: string[];
    locations?: number[];
    languages?: string[];
    searchEngines?: string[];
  };
}

export interface AddKeywordForm {
  keywords: string[];
  location_code?: number;
  language_code?: string;
  search_engine?: string;
}

export interface BacklinkAnalysisForm {
  target_url: string;
  mode?: 'as_is' | 'one_per_domain' | 'one_per_anchor';
  include_subdomains?: boolean;
  limit?: number;
}

export interface TechnicalAuditForm {
  urls: string[];
  max_crawl_pages?: number;
  include_subdomains?: boolean;
  check_resources?: boolean;
}

export interface ContentAnalysisForm {
  query: string;
  content_type?: string;
  location_code?: number;
  language_code?: string;
  date_from?: string;
  date_to?: string;
} 