'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { AdminApi } from '@/utils/adminApi';
import { COMMON_LOCATIONS, DEFAULT_LOCATION, type Location } from '@/lib/seo/locations';
import {
  LinkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  GlobeAltIcon,
  TagIcon,
  BuildingOfficeIcon,
  EyeIcon,
  CheckBadgeIcon,
  XMarkIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

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

export default function BacklinksPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  
  // Form state
  const [domain, setDomain] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacklinkAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Table state
  const [activeTab, setActiveTab] = useState<'backlinks' | 'referring-domains' | 'top-pages' | 'anchors' | 'history' | 'competitors' | 'breakdown'>('backlinks');
  const [sortField, setSortField] = useState<string>('domain_from_rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'dofollow' | 'nofollow' | 'new' | 'lost'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!domain.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await AdminApi.callAdminApi('admin/seo/backlinks', {
        domain: domain.trim(),
        location_name: selectedLocation.location_name,
        language_name: selectedLocation.language_name,
        limit: 1000,
        offset: 0,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setResult(response);
    } catch (err) {
      console.error('Backlink analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze backlinks');
    } finally {
      setLoading(false);
    }
  }, [domain, selectedLocation]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getFilteredBacklinks = () => {
    if (!result) return [];
    
    let filtered = result.backlinks;
    
    // Apply type filter
    if (filterType === 'dofollow') filtered = filtered.filter(b => !b.nofollow);
    if (filterType === 'nofollow') filtered = filtered.filter(b => b.nofollow);
    if (filterType === 'new') filtered = filtered.filter(b => b.is_new);
    if (filterType === 'lost') filtered = filtered.filter(b => b.is_lost);
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.domain_from.toLowerCase().includes(search) ||
        b.anchor.toLowerCase().includes(search) ||
        b.title_from.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof BacklinkItem] as any;
      const bVal = b[sortField as keyof BacklinkItem] as any;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });
    
    return filtered;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'desc' ? 
      <ArrowDownIcon className="h-4 w-4" /> : 
      <ArrowUpIcon className="h-4 w-4" />;
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Backlink Analysis
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Analyze your website's backlink profile and monitor link quality metrics
        </p>
      </div>

      {/* Analysis Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                Analyze Backlinks
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <LinkIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Backlinks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(result.summary.totalBacklinks)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <GlobeAltIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Referring Domains</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(result.summary.referringDomains)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Domain Rank</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.rank}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <FlagIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spam Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.spamScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dofollow vs Nofollow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dofollow Links</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatNumber(result.summary.dofollowBacklinks)}
                  </p>
                </div>
                <CheckBadgeIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nofollow Links</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatNumber(result.summary.nofollowBacklinks)}
                  </p>
                </div>
                <XMarkIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New/Lost</p>
                  <p className="text-xl font-bold text-blue-600">
                    +{formatNumber(result.summary.newBacklinks)} / -{formatNumber(result.summary.lostBacklinks)}
                  </p>
                </div>
                <ArrowTopRightOnSquareIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'backlinks', label: 'Backlinks', count: result.backlinks.length },
                  { id: 'referring-domains', label: 'Referring Domains', count: result.referringDomains.length },
                  { id: 'top-pages', label: 'Top Pages', count: result.topPages.length },
                  { id: 'anchors', label: 'Anchor Texts', count: result.anchors.length },
                  { id: 'history', label: 'History', count: result.history.length },
                  { id: 'competitors', label: 'Competitors', count: result.competitors.length },
                  { id: 'breakdown', label: 'Breakdown', count: null },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Backlinks Tab */}
              {activeTab === 'backlinks' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search backlinks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Backlinks</option>
                      <option value="dofollow">Dofollow Only</option>
                      <option value="nofollow">Nofollow Only</option>
                      <option value="new">New Links</option>
                      <option value="lost">Lost Links</option>
                    </select>
                  </div>

                  {/* Backlinks Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {[
                            { field: 'domain_from', label: 'Domain' },
                            { field: 'anchor', label: 'Anchor Text' },
                            { field: 'domain_from_rank', label: 'Domain Rank' },
                            { field: 'nofollow', label: 'Type' },
                            { field: 'crawl_date', label: 'Last Seen' },
                          ].map((col) => (
                            <th
                              key={col.field}
                              onClick={() => handleSort(col.field)}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <div className="flex items-center gap-1">
                                {col.label}
                                {getSortIcon(col.field)}
                              </div>
                            </th>
                          ))}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {getFilteredBacklinks().slice(0, 50).map((backlink, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {backlink.domain_from}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {backlink.tld_from} • {backlink.domain_from_country}
                                  </div>
                                </div>
                                {backlink.is_new && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    New
                                  </span>
                                )}
                                {backlink.is_lost && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Lost
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                {backlink.anchor || 'No anchor text'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {backlink.domain_from_rank || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                backlink.nofollow 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {backlink.nofollow ? 'Nofollow' : 'Dofollow'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(backlink.crawl_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                             <a
                                 href={backlink.url_from}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                               >
                                 <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                               </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Referring Domains Tab */}
              {activeTab === 'referring-domains' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Backlinks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Domain Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Platform
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.referringDomains.slice(0, 50).map((domain, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {domain.domain}
                              </div>
                              {domain.is_new && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  New
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {domain.backlinks_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {domain.rank || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {domain.country || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {domain.platform_type.join(', ') || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Top Pages Tab */}
              {activeTab === 'top-pages' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Page URL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Backlinks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Referring Domains
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Page Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.topPages.slice(0, 50).map((page, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                              {page.url}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {page.backlinks_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {page.referring_domains}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {page.rank || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                         <a
                               href={page.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                             >
                               <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                             </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                             )}

              {/* Anchors Tab */}
              {activeTab === 'anchors' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Anchor Text
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Backlinks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Referring Domains
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          First Seen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rank
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.anchors.slice(0, 50).map((anchor, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-md">
                              {anchor.anchor || 'No anchor text'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {anchor.backlinks_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {anchor.referring_domains}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(anchor.first_seen)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {anchor.rank || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Chart placeholder - could be implemented with Chart.js or similar */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Timeline chart would be displayed here with historical backlink data
                    </p>
                  </div>
                  
                  {/* Historical data table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Backlinks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Referring Domains
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            New Links
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Lost Links
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Net Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {result.history.slice(0, 30).map((day, index) => {
                          const netChange = day.new_backlinks - day.lost_backlinks;
                          return (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatDate(day.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatNumber(day.backlinks)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatNumber(day.referring_domains)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                +{day.new_backlinks}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                -{day.lost_backlinks}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {netChange >= 0 ? '+' : ''}{netChange}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Competitors Tab */}
              {activeTab === 'competitors' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Competitor Domain
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Common Backlinks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Similarity Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Domain Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Organic Keywords
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Organic Traffic
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.competitors.slice(0, 20).map((competitor, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {competitor.domain}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {competitor.common_backlinks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round(competitor.jaccard_index * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {(competitor.jaccard_index * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {competitor.rank || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(competitor.organic_keywords)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(competitor.organic_traffic)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Breakdown Tab */}
              {activeTab === 'breakdown' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Country Breakdown */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">By Country</h3>
                    <div className="space-y-2">
                      {result.breakdown.byCountry.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-900 dark:text-white">{item.country}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TLD Breakdown */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">By TLD</h3>
                    <div className="space-y-2">
                      {result.breakdown.byTLD.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-900 dark:text-white">.{item.tld}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Breakdown */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">By Platform</h3>
                    <div className="space-y-2">
                      {result.breakdown.byPlatform.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{item.platform}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Follow Type Breakdown */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Follow Type</h3>
                    <div className="space-y-2">
                      {result.breakdown.byFollowType.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{item.type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${item.type === 'dofollow' ? 'bg-green-600' : 'bg-yellow-600'}`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 