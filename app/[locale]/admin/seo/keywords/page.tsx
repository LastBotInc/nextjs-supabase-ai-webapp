'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { SEOProject, KeywordResearch } from '@/types/seo';
import { Link } from '@/app/i18n/navigation';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { InformationCircleIcon, MagnifyingGlassIcon as MagnifyingGlassSolidIcon } from '@heroicons/react/24/solid';
import { getKeywordGenerationDescription } from '@/lib/brand-info';
import SERPAnalysisModal from '@/components/admin/seo/SERPAnalysisModal';
import { SERPResult } from '@/types/seo';

interface KeywordResearchWithProject extends KeywordResearch {
  project?: {
    id: string;
    name: string;
    domain: string;
  };
}

interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  search_intent: string;
}

export default function KeywordResearchPage() {
  const t = useTranslations('Admin.SEO.keywords');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const [projects, setProjects] = useState<SEOProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [keywords, setKeywords] = useState<KeywordResearchWithProject[]>([]);
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationCode, setLocationCode] = useState(2840); // US default
  const [languageCode, setLanguageCode] = useState('en');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [companyDescription, setCompanyDescription] = useState(getKeywordGenerationDescription());
  
  // State for SERP Analysis Modal
  const [isSERPModalOpen, setSERPModalOpen] = useState(false);
  const [serpResults, setSerpResults] = useState<SERPResult | null>(null);
  const [selectedKeywordForSERP, setSelectedKeywordForSERP] = useState<string>('');
  const [isAnalyzingSERP, setIsAnalyzingSERP] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!session?.user || !isAdmin) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('seo_projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      // Auto-select first project if available
      if (data && data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    }
  }, [session, isAdmin, selectedProject]);

  const fetchKeywords = useCallback(async () => {
    if (!session?.user || !isAdmin || !selectedProject) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('keyword_research')
        .select(`
          *,
          seo_projects(name, domain)
        `)
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setKeywords(data || []);
    } catch (err) {
      console.error('Failed to fetch keywords:', err);
      setError(err instanceof Error ? err.message : 'Failed to load keywords');
    }
  }, [session, isAdmin, selectedProject]);

  const performKeywordResearch = async () => {
    if (!searchQuery.trim() || !selectedProject || researching) return;

    setResearching(true);
    setError(null);

    try {
      // Get auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/seo/keywords/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          project_id: selectedProject,
          seed_keywords: [searchQuery.trim()],
          location_code: locationCode,
          language_code: languageCode,
          include_suggestions: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to perform keyword research');
      }

      // Update suggestions from API response
      if (result.data?.suggestions) {
        setSuggestions(result.data.suggestions);
      }

      // Refresh keywords list
      await fetchKeywords();

      setSearchQuery('');
    } catch (err) {
      console.error('Keyword research failed:', err);
      setError(err instanceof Error ? err.message : 'Keyword research failed');
    } finally {
      setResearching(false);
    }
  };

  const saveKeywordToProject = async (keyword: KeywordSuggestion) => {
    if (!selectedProject) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('keyword_research')
        .insert({
          project_id: selectedProject,
          keyword: keyword.keyword,
          search_volume: keyword.search_volume,
          cpc: keyword.cpc,
          competition: keyword.competition,
          difficulty: keyword.difficulty,
          search_intent: keyword.search_intent,
          related_keywords: [],
          trends_data: {},
        });

      if (error) throw error;

      // Remove from suggestions and refresh keywords
      setSuggestions(prev => prev.filter(k => k.keyword !== keyword.keyword));
      await fetchKeywords();
    } catch (err) {
      console.error('Failed to save keyword:', err);
      setError(err instanceof Error ? err.message : 'Failed to save keyword');
    }
  };

  const deleteKeyword = async (keywordId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('keyword_research')
        .delete()
        .eq('id', keywordId);

      if (error) throw error;

      // Refresh keywords list
      await fetchKeywords();
    } catch (err) {
      console.error('Failed to delete keyword:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete keyword');
    }
  };

  const generateAIKeywords = async () => {
    if (!selectedProject || aiGenerating) return;

    setAiGenerating(true);
    setError(null);

    try {
      // Get auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Get current project info
      const currentProject = projects.find(p => p.id === selectedProject);
      const description = companyDescription || currentProject?.description || '';
      const domain = currentProject?.domain || '';

      // Get existing keywords to avoid duplicates
      const existingKeywords = keywords.map(k => k.keyword);

      const response = await fetch('/api/seo/keywords/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          project_id: selectedProject,
          company_description: description,
          domain: domain,
          existing_keywords: existingKeywords,
          location_code: locationCode,
          language_code: languageCode,
          count: 10,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate AI keywords');
      }

      // Update suggestions from AI-generated keywords
      if (result.data?.suggestions) {
        setSuggestions(prev => [...prev, ...result.data.suggestions]);
      }

      // No need to refresh keywords list since AI generation no longer auto-saves keywords
      // Keywords will be saved only when user clicks "Add Keyword" button

    } catch (err) {
      console.error('AI keyword generation failed:', err);
      setError(err instanceof Error ? err.message : 'AI keyword generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAnalyzeSERP = async (keyword: string) => {
    setSelectedKeywordForSERP(keyword);
    setIsAnalyzingSERP(true);
    setSerpResults(null);
    setSERPModalOpen(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/seo/serp/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          keyword: keyword,
          location_code: locationCode,
          language_code: languageCode,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Failed to analyze SERP');
      }
      
      const serpData = result.data?.tasks?.[0]?.result?.[0];
      setSerpResults(serpData || null);

    } catch (err) {
      console.error('SERP analysis failed:', err);
      setError(err instanceof Error ? err.message : 'SERP analysis failed');
      // Keep modal open to show error message or no results
    } finally {
      setIsAnalyzingSERP(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProjects();
    }
  }, [fetchProjects, authLoading]);

  useEffect(() => {
    if (selectedProject) {
      fetchKeywords();
    }
  }, [fetchKeywords, selectedProject]);

  useEffect(() => {
    // Set loading to false once projects are fetched
    if (!authLoading && projects !== undefined) {
      setLoading(false);
    }
  }, [authLoading, projects]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('loading')}
          </p>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Show message if no projects exist
  if (projects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('noProjects.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('noProjects.description')}
          </p>
          <Link
            href="/admin/seo/projects/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('noProjects.createButton')}
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'text-green-600 bg-green-100';
    if (difficulty <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompetitionColor = (competition: number) => {
    if (competition <= 0.3) return 'text-green-600 bg-green-100';
    if (competition <= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Keyword Research
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and analyze keywords for your SEO strategy
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Project Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('selectProject')}
        </label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">{t('projects.select', { ns: 'Admin.SEO' })}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.domain})
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Keyword Research Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('research')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('seedKeyword')}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('enterKeyword')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && performKeywordResearch()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('location')}
                </label>
                <select
                  value={locationCode}
                  onChange={(e) => setLocationCode(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={2840}>{t('locations.2840')}</option>
                  <option value={2826}>{t('locations.2826')}</option>
                  <option value={2124}>{t('locations.2124')}</option>
                  <option value={2276}>{t('locations.2276')}</option>
                  <option value={2250}>{t('locations.2250')}</option>
                  <option value={2752}>{t('locations.2752')}</option>
                  <option value={2246}>{t('locations.2246')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('language')}
                </label>
                <select
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="en">{t('languages.en')}</option>
                  <option value="fi">{t('languages.fi')}</option>
                  <option value="sv">{t('languages.sv')}</option>
                  <option value="de">{t('languages.de')}</option>
                  <option value="fr">{t('languages.fr')}</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={performKeywordResearch}
              disabled={!searchQuery.trim() || researching}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
            >
              {researching ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              )}
              {researching ? t('researching') : t('research')}
            </button>
          </div>

          {/* AI Keyword Generation */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700 p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg mr-3">
                <LightBulbIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('ai.title')}
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('ai.description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('ai.targetLocation')}
                </label>
                <select
                  value={locationCode}
                  onChange={(e) => setLocationCode(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={2840}>United States</option>
                  <option value={2826}>United Kingdom</option>
                  <option value={2124}>Canada</option>
                  <option value={2276}>Germany</option>
                  <option value={2250}>France</option>
                  <option value={2752}>Sweden</option>
                  <option value={2246}>Finland</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('ai.targetLanguage')}
                </label>
                <select
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="fi">Finnish</option>
                  <option value="sv">Swedish</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('ai.companyDescription')}
              </label>
              <textarea
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder={t('ai.companyDescriptionPlaceholder')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('ai.companyDescriptionHelp')}
              </p>
            </div>
            
            <button
              onClick={generateAIKeywords}
              disabled={aiGenerating || !selectedProject}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-md transition-all duration-200 transform hover:scale-105"
            >
              {aiGenerating ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LightBulbIcon className="w-4 h-4 mr-2" />
              )}
              {aiGenerating ? t('ai.generating') : t('ai.generateCount', { count: 10 })}
            </button>
          </div>

          {/* Keyword Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('suggestions')}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('seedKeyword')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('searchVolume')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('cpc')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('competition')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('difficulty')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('intent')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {suggestions.map((suggestion, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {suggestion.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {formatNumber(suggestion.search_volume)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            ${suggestion.cpc.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompetitionColor(suggestion.competition)}`}>
                            {(suggestion.competition * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(suggestion.difficulty)}`}>
                            {suggestion.difficulty}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <span className="capitalize">{suggestion.search_intent}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAnalyzeSERP(suggestion.keyword)}
                              className="text-gray-400 hover:text-blue-500"
                              title={t('serp.analyzeTooltip')}
                            >
                              <MagnifyingGlassSolidIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => saveKeywordToProject(suggestion)}
                              className="flex items-center bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            >
                              <PlusCircleIcon className="h-5 w-5 mr-1" />
                              {t('addKeyword')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Saved Keywords */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('saved')}
            </h2>
            
            {keywords.length === 0 ? (
              <div className="text-center py-8">
                <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('noKeywords')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('seedKeyword')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('searchVolume')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('cpc')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('competition')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('difficulty')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('intent')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('added')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {keywords.map((keyword) => (
                      <tr key={keyword.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {keyword.search_volume ? (
                            <div className="flex items-center">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              {formatNumber(keyword.search_volume)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {keyword.cpc && Number(keyword.cpc) > 0 ? (
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                              ${Number(keyword.cpc).toFixed(2)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {keyword.competition && Number(keyword.competition) > 0 ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompetitionColor(Number(keyword.competition))}`}>
                              {(Number(keyword.competition) * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {keyword.difficulty && Number(keyword.difficulty) > 0 ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(Number(keyword.difficulty))}`}>
                              {Number(keyword.difficulty)}/100
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <span className="capitalize">{keyword.search_intent}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(keyword.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => deleteKeyword(keyword.id)}
                            className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
                          >
                            <TrashIcon className="w-3 h-3 mr-1" />
                            {t('deleteKeyword')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      <SERPAnalysisModal
        isOpen={isSERPModalOpen}
        onClose={() => setSERPModalOpen(false)}
        results={serpResults}
        keyword={selectedKeywordForSERP}
        loading={isAnalyzingSERP}
      />
    </div>
  );
}
