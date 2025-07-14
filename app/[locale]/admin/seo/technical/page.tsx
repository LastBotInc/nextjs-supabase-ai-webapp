'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { AdminApi } from '@/utils/adminApi';
import { createClient } from '@/utils/supabase/client';
import ProjectSelector from '@/components/admin/seo/ProjectSelector';
import { COMMON_LOCATIONS, DEFAULT_LOCATION, type Location } from '@/lib/seo/locations';
import type { SEOProject } from '@/types/seo';
import {
  CogIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LinkIcon,
  DocumentTextIcon,
  BugAntIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

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

export default function TechnicalAuditPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  
  // Form state
  const [domain, setDomain] = useState('');
  const [selectedProject, setSelectedProject] = useState<SEOProject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'starting' | 'processing' | 'completed' | 'error'>('idle');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [pollAttempts, setPollAttempts] = useState(0);
  const [result, setResult] = useState<TechnicalAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Table state
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'performance' | 'issues'>('overview');
  const [sortField, setSortField] = useState<string>('status_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'warnings' | 'success'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle project change
  const handleProjectChange = useCallback((projectId: string, project: SEOProject) => {
    setSelectedProject(project);
    // Auto-populate domain from project
    if (project.domain) {
      setDomain(project.domain);
    }
  }, []);

  // Load initial project from localStorage
  useEffect(() => {
    const loadInitialProject = async () => {
      const savedProjectId = localStorage.getItem('selectedSeoProjectId');
      if (savedProjectId) {
        const supabase = createClient();
        const { data: project } = await supabase
          .from('seo_projects')
          .select('*')
          .eq('id', savedProjectId)
          .single();
        
        if (project) {
          setSelectedProject(project);
          setDomain(project.domain);
        }
      }
    };
    
    loadInitialProject();
  }, []);

  const cancelAnalysis = useCallback(() => {
    console.log('🛑 Canceling analysis...')
    setLoading(false)
    setTaskId(null)
    setPollingStatus('idle')
    setEstimatedTime('')
    setPollAttempts(0)
    setError(null)
  }, [])

  const pollTaskStatus = useCallback(async (taskId: string, attemptCount = 0) => {
    const maxAttempts = 60 // 10 minutes maximum (60 attempts * 10 seconds)
    
    try {
      setPollAttempts(attemptCount + 1)
      console.log(`🔍 Polling attempt ${attemptCount + 1}/${maxAttempts} for task:`, taskId)
      
      const response = await AdminApi.callAdminApi('admin/seo/technical-audit/status', {
        taskId
      })

      console.log('📊 Poll response:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.status === 'processing') {
        setPollingStatus('processing')
        
        // Check if we've reached max attempts
        if (attemptCount >= maxAttempts) {
          throw new Error('Analysis timed out after 10 minutes. The website may be too large or complex.')
        }
        
        // Continue polling with exponential backoff (but cap at 30 seconds)
        const delay = Math.min(10000 + (attemptCount * 2000), 30000)
        console.log(`⏰ Next poll in ${delay/1000} seconds...`)
        setTimeout(() => pollTaskStatus(taskId, attemptCount + 1), delay)
      } else if (response.status === 'completed') {
        console.log('✅ Task completed successfully!')
        setPollingStatus('completed')
        setResult(response.data)
        setLoading(false)
        setTaskId(null)
        setPollAttempts(0)
      } else if (response.status === 'error') {
        throw new Error(response.error || 'Unknown error occurred')
      } else {
        throw new Error(`Unexpected response status: ${response.status}`)
      }
    } catch (err) {
      console.error('❌ Polling error:', err)
      setPollingStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to check task status')
      setLoading(false)
      setTaskId(null)
      setPollAttempts(0)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!domain.trim() || loading) return

    try {
      setLoading(true)
      setError(null)
      setResult(null)
      setPollingStatus('starting')
      setPollAttempts(0)

      // Start the crawl task
      const response = await AdminApi.callAdminApi('admin/seo/technical-audit', {
        domain: domain.trim(),
        location: selectedLocation.location_name,
        language: selectedLocation.language_name,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.status === 'started') {
        setTaskId(response.taskId)
        setEstimatedTime(response.estimatedTime)
        setPollingStatus('processing')
        
        // Start polling for results
        setTimeout(() => pollTaskStatus(response.taskId), 5000)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err) {
      console.error('Technical audit error:', err)
      setPollingStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to start website analysis')
      setLoading(false)
      setPollAttempts(0)
    }
  }, [domain, selectedLocation, pollTaskStatus])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getFilteredPages = () => {
    if (!result) return [];
    
    let filtered = result.pages;
    
    // Apply filter
    if (filterType !== 'all') {
      filtered = filtered.filter(page => {
        if (filterType === 'errors') return page.checks_errors.length > 0;
        if (filterType === 'warnings') return page.checks_warnings.length > 0;
        if (filterType === 'success') return page.status_code >= 200 && page.status_code < 300;
        return true;
      });
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(page =>
        page.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.page_meta.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const getValue = (item: any) => {
        switch (sortField) {
          case 'url': return item.url;
          case 'title': return item.page_meta.title;
          case 'status_code': return item.status_code;
          case 'size': return item.size;
          case 'load_time': return item.page_timing.time_to_interactive;
          default: return 0;
        }
      };
      
      const aVal = getValue(a);
      const bVal = getValue(b);
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return filtered;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4" />
      : <ArrowDownIcon className="h-4 w-4" />;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('unauthorized')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('unauthorizedDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Technical SEO Audit
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyze your website's technical SEO health and performance
            </p>
          </div>
          <ProjectSelector 
            currentProjectId={selectedProject?.id}
            onProjectChange={handleProjectChange}
          />
        </div>
      </div>

      {/* Analysis Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain to Analyze
            </label>
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <select
              id="location"
              value={selectedLocation.location_name}
              onChange={(e) => {
                const location = COMMON_LOCATIONS.find(loc => loc.location_name === e.target.value) || DEFAULT_LOCATION;
                setSelectedLocation(location);
              }}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              {COMMON_LOCATIONS.map((location) => (
                <option key={location.location_name} value={location.location_name}>
                  {location.location_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={!domain.trim() || loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pollingStatus === 'starting' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Analysis...
                </>
              ) : pollingStatus === 'processing' ? (
                <>
                  <div className="animate-pulse h-4 w-4 bg-white rounded-full mr-2"></div>
                  Processing...
                </>
              ) : loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Display */}
      {(pollingStatus === 'processing' || pollingStatus === 'starting') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  {pollingStatus === 'starting' ? 'Starting website crawl...' : 'Crawling website pages...'}
                </p>
                <p className="text-blue-600 dark:text-blue-300 text-sm">
                  {estimatedTime ? `Estimated time: ${estimatedTime}` : 'This may take several minutes for large websites'}
                  {pollingStatus === 'processing' && pollAttempts > 0 && (
                    <span className="ml-2">• Check {pollAttempts}/60</span>
                  )}
                </p>
                {taskId && (
                  <p className="text-blue-500 dark:text-blue-400 text-xs font-mono mt-1">
                    Task ID: {taskId}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={cancelAnalysis}
              className="ml-4 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
          
          {/* Progress bar */}
          {pollingStatus === 'processing' && pollAttempts > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((pollAttempts / 60) * 100)}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((pollAttempts / 60) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pages Crawled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(result.summary.crawledPages)}</p>
                </div>
                <GlobeAltIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{formatNumber(result.summary.errors)}</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(result.summary.warnings)}</p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Load Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(result.summary.avgLoadTime)}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Lighthouse Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Lighthouse Scores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'Performance', score: result.lighthouse.performance, icon: ChartBarIcon },
                { name: 'Accessibility', score: result.lighthouse.accessibility, icon: DevicePhoneMobileIcon },
                { name: 'Best Practices', score: result.lighthouse.best_practices, icon: CheckCircleIcon },
                { name: 'SEO', score: result.lighthouse.seo, icon: MagnifyingGlassIcon },
              ].map((metric) => (
                <div key={metric.name} className={`p-4 rounded-lg ${getScoreBackgroundColor(metric.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.name}</span>
                    <metric.icon className={`h-5 w-5 ${getScoreColor(metric.score)}`} />
                  </div>
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>{metric.score}</span>
                    <span className="text-sm text-gray-500 ml-1">/100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${metric.score >= 90 ? 'bg-green-600' : metric.score >= 50 ? 'bg-orange-600' : 'bg-red-600'}`}
                      style={{ width: `${metric.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
                  { id: 'pages', label: 'Pages', count: result.pages.length, icon: GlobeAltIcon },
                  { id: 'performance', label: 'Performance', icon: ChartBarIcon },
                  { id: 'issues', label: 'Issues', count: result.issues.length, icon: BugAntIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-2 py-0.5 px-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Pages:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.summary.totalPages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average Page Size:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatBytes(result.summary.avgPageSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Duplicate Pages:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.summary.duplicatePages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Broken Links:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.summary.brokenLinks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Redirects:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.summary.redirects}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issues Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-red-600 flex items-center">
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Errors
                        </span>
                        <span className="font-medium text-red-600">{result.summary.errors}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                          Warnings
                        </span>
                        <span className="font-medium text-orange-600">{result.summary.warnings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 flex items-center">
                          <InformationCircleIcon className="h-4 w-4 mr-2" />
                          Notices
                        </span>
                        <span className="font-medium text-blue-600">{result.summary.notices}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pages Tab */}
              {activeTab === 'pages' && (
                <div>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Pages</option>
                      <option value="errors">With Errors</option>
                      <option value="warnings">With Warnings</option>
                      <option value="success">Successful</option>
                    </select>
                  </div>

                  {/* Pages Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('url')}>
                            <div className="flex items-center">
                              URL {getSortIcon('url')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status_code')}>
                            <div className="flex items-center">
                              Status {getSortIcon('status_code')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('size')}>
                            <div className="flex items-center">
                              Size {getSortIcon('size')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('load_time')}>
                            <div className="flex items-center">
                              Load Time {getSortIcon('load_time')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Issues
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {getFilteredPages().slice(0, 50).map((page, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                                <a href={page.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center">
                                  {page.url}
                                  <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {page.page_meta.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                page.status_code >= 200 && page.status_code < 300
                                  ? 'bg-green-100 text-green-800'
                                  : page.status_code >= 300 && page.status_code < 400
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {page.status_code}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatBytes(page.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatTime(page.page_timing.time_to_interactive)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {page.checks_errors.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {page.checks_errors.length} errors
                                  </span>
                                )}
                                {page.checks_warnings.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {page.checks_warnings.length} warnings
                                  </span>
                                )}
                                {page.checks_errors.length === 0 && page.checks_warnings.length === 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                    OK
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Core Web Vitals */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Core Web Vitals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.pages.slice(0, 1).map((page, index) => (
                        <div key={index} className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Largest Contentful Paint</h5>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(page.page_timing.largest_contentful_paint)}</p>
                            <p className="text-sm text-gray-500">Target: &lt; 2.5s</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">First Input Delay</h5>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(page.page_timing.first_input_delay)}</p>
                            <p className="text-sm text-gray-500">Target: &lt; 100ms</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Cumulative Layout Shift</h5>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{page.page_timing.cumulative_layout_shift.toFixed(3)}</p>
                            <p className="text-sm text-gray-500">Target: &lt; 0.1</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Distribution */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Distribution</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Performance charts would be displayed here
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Issues Tab */}
              {activeTab === 'issues' && (
                <div className="space-y-4">
                  {result.issues.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No issues found!</p>
                    </div>
                  ) : (
                    result.issues.map((issue, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${
                        issue.type === 'error' 
                          ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                          : issue.type === 'warning'
                          ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800'
                          : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
                      }`}>
                        <div className="flex items-start">
                          {issue.type === 'error' && <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />}
                          {issue.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />}
                          {issue.type === 'notice' && <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />}
                          <div className="flex-1">
                            <h5 className={`font-medium ${
                              issue.type === 'error' 
                                ? 'text-red-800 dark:text-red-200'
                                : issue.type === 'warning'
                                ? 'text-orange-800 dark:text-orange-200'
                                : 'text-blue-800 dark:text-blue-200'
                            }`}>
                              {issue.message}
                            </h5>
                            <p className={`text-sm mt-1 ${
                              issue.type === 'error' 
                                ? 'text-red-700 dark:text-red-300'
                                : issue.type === 'warning'
                                ? 'text-orange-700 dark:text-orange-300'
                                : 'text-blue-700 dark:text-blue-300'
                            }`}>
                              Affects {issue.pages_count} page{issue.pages_count !== 1 ? 's' : ''}
                            </p>
                            {issue.urls.length > 0 && (
                              <details className="mt-2">
                                <summary className={`cursor-pointer text-sm ${
                                  issue.type === 'error' 
                                    ? 'text-red-600 dark:text-red-400'
                                    : issue.type === 'warning'
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  Show affected URLs
                                </summary>
                                <ul className="mt-2 space-y-1">
                                  {issue.urls.map((url, urlIndex) => (
                                    <li key={urlIndex} className="text-xs text-gray-600 dark:text-gray-400">
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                        {url}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 