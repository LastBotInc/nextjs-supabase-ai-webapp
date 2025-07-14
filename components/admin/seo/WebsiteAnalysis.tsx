'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  LinkIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { AdminApi } from '@/utils/adminApi';
import { createClient } from '@/utils/supabase/client';
import ProjectSelector from '@/components/admin/seo/ProjectSelector';
import { COMMON_LOCATIONS, DEFAULT_LOCATION, type Location } from '@/lib/seo/locations';
import type { SEOProject } from '@/types/seo';

interface WebsiteAnalysisProps {
  onAnalysisComplete?: (data: any) => void;
}

interface AnalysisResult {
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
    issues: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
}

export default function WebsiteAnalysis({ onAnalysisComplete }: WebsiteAnalysisProps) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>(DEFAULT_LOCATION);
  const [includeKeywords, setIncludeKeywords] = useState(true);
  const [includeBacklinks, setIncludeBacklinks] = useState(true);
  const [includeCompetitors, setIncludeCompetitors] = useState(true);
  const [includeTechnical, setIncludeTechnical] = useState(true);
  const [keywordLimit, setKeywordLimit] = useState(50);
  const [selectedProject, setSelectedProject] = useState<SEOProject | null>(null);

  // Load saved project on mount
  useEffect(() => {
    const loadSavedProject = async () => {
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
          // Auto-populate domain from project
          if (project.domain) {
            setDomain(project.domain);
          }
        }
      }
    };
    
    loadSavedProject();
  }, []);

  const handleProjectChange = useCallback((projectId: string, project: SEOProject) => {
    setSelectedProject(project);
    // Auto-populate domain when project changes
    if (project.domain) {
      setDomain(project.domain);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 [WebsiteAnalysis] Starting analysis for domain:', domain);
      console.log('🚀 [WebsiteAnalysis] Analysis options:', {
        includeKeywords,
        includeBacklinks,
        includeCompetitors,
        includeTechnical,
        keywordLimit
      });

      const response = await AdminApi.callAdminApi('admin/seo/website-analysis', {
        domain: domain.trim(),
        location_name: selectedLocation.location_name,
        language_name: selectedLocation.language_name,
        includeKeywords,
        includeBacklinks,
        includeCompetitors,
        includeTechnical,
        keywordLimit,
      });

      console.log('📥 [WebsiteAnalysis] Raw API response:', response);

      if (response.data) {
        console.log('✅ [WebsiteAnalysis] Analysis data received:', response.data);
        console.log('📊 [WebsiteAnalysis] Data summary:', {
          domain: response.data.domain,
          domainOverview: response.data.domainOverview,
          rankedKeywordsCount: response.data.rankedKeywords?.length || 0,
          keywordsForSiteCount: response.data.keywordsForSite?.length || 0,
          competitorsCount: response.data.competitors?.length || 0,
          backlinks: response.data.backlinks,
          technicalSeo: response.data.technicalSeo
        });
        
        setResult(response.data);
        onAnalysisComplete?.(response.data);
      } else {
        console.error('❌ [WebsiteAnalysis] No data in response:', response);
        setError('No analysis data received');
      }
    } catch (err) {
      console.error('❌ [WebsiteAnalysis] Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Website Analysis
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive SEO analysis using DataForSEO
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ProjectSelector 
            currentProjectId={selectedProject?.id}
            onProjectChange={handleProjectChange}
          />
          <GlobeAltIcon className="h-6 w-6 text-blue-500" />
        </div>
      </div>

      {/* Analysis Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain to Analyze
            </label>
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Location & Language
            </label>
            <select
              id="location"
              value={selectedLocation.location_code}
              onChange={(e) => {
                const location = COMMON_LOCATIONS.find(loc => loc.location_code === parseInt(e.target.value));
                if (location) setSelectedLocation(location);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              {COMMON_LOCATIONS.map((location) => (
                <option key={location.location_code} value={location.location_code}>
                  {location.location_name} ({location.language_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !domain.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <ClockIcon className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4" />
                Analyze
              </>
            )}
          </button>
        </div>

        {/* Analysis Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeKeywords}
              onChange={(e) => setIncludeKeywords(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Keywords</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeBacklinks}
              onChange={(e) => setIncludeBacklinks(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Backlinks</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeCompetitors}
              onChange={(e) => setIncludeCompetitors(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Competitors</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeTechnical}
              onChange={(e) => setIncludeTechnical(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Technical</span>
          </label>
        </div>

        <div>
          <label htmlFor="keywordLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Keyword Limit: {keywordLimit}
          </label>
          <input
            type="range"
            id="keywordLimit"
            min="10"
            max="100"
            step="10"
            value={keywordLimit}
            onChange={(e) => setKeywordLimit(parseInt(e.target.value))}
            className="w-full"
            disabled={loading}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-8 text-center">
          <ClockIcon className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing website... This may take a few moments.
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Domain Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Domain Overview - {result.domain}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(result.domainOverview.organicKeywords)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Organic Keywords</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(result.domainOverview.organicTraffic)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Organic Traffic</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(result.domainOverview.backlinks)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Backlinks</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.domainOverview.domainRank}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Domain Rank</div>
              </div>
            </div>
          </div>

          {/* Ranked Keywords */}
          {result.rankedKeywords.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-green-500" />
                Top Ranked Keywords ({result.rankedKeywords.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Search Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        CPC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {result.rankedKeywords.slice(0, 10).map((keyword, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          #{keyword.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(keyword.searchVolume)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(keyword.cpc)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Keywords for Site */}
          {result.keywordsForSite.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                Keywords for Site ({result.keywordsForSite.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Search Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        CPC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Competition
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {result.keywordsForSite.slice(0, 10).map((keyword, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(keyword.searchVolume)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(keyword.cpc)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(keyword.competition * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Competitors */}
          {result.competitors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-orange-500" />
                Top Competitors ({result.competitors.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Organic Keywords
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Organic Traffic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Intersections
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {result.competitors.slice(0, 10).map((competitor, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {competitor.domain}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(competitor.organicKeywords)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(competitor.organicTraffic)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {competitor.intersections}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Backlinks Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <LinkIcon className="h-5 w-5 mr-2 text-red-500" />
              Backlinks Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(result.backlinks.totalBacklinks)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Backlinks</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(result.backlinks.referringDomains)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Referring Domains</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.backlinks.rank}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Domain Rank</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.backlinks.spamScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Spam Score</div>
              </div>
            </div>
          </div>

          {/* Technical SEO */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Technical SEO
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {result.technicalSeo.title || 'Not found'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">H1:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {result.technicalSeo.h1 || 'Not found'}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {result.technicalSeo.description || 'Not found'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${result.technicalSeo.httpsEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">HTTPS</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${result.technicalSeo.mobileOptimized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mobile Optimized</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Load Time: {result.technicalSeo.loadTime}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 