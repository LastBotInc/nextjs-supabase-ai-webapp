'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import SEODashboard from '@/components/admin/seo/SEODashboard';
import ProjectSelector from '@/components/admin/seo/ProjectSelector';
import { SEOProject, SERPTracking } from '@/types/seo';

// Extended interface for SERP data with joined project information
interface SERPTrackingWithProject extends SERPTracking {
  seo_projects?: {
    name: string;
    domain: string;
  };
}

export default function SEOPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const [projects, setProjects] = useState<SEOProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SEOProject | null>(null);
  const [recentSerpData, setRecentSerpData] = useState<SERPTrackingWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user || !isAdmin) {
      if (!authLoading) setError('Unauthorized access');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('seo_projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch recent SERP data - filter by selected project if available
      let serpQuery = supabase
        .from('serp_tracking')
        .select(`
          *,
          seo_projects(name, domain)
        `)
        .order('tracked_at', { ascending: false })
        .limit(10);
      
      if (selectedProject) {
        serpQuery = serpQuery.eq('project_id', selectedProject.id);
      }

      const { data: serpData, error: serpError } = await serpQuery;

      if (serpError) throw serpError;

      setProjects(projectsData || []);
      setRecentSerpData(serpData || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [session, isAdmin, authLoading, selectedProject]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, authLoading]);

  const handleProjectChange = (projectId: string, project: SEOProject) => {
    setSelectedProject(project);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SEO Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SEO Dashboard
          </h1>
          <p className="mt-2 text-red-600 dark:text-red-400">
            Error: {error}
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate metrics
  const totalProjects = projects.length;
  const totalKeywords = 0; // TODO: Calculate from actual data
  const totalBacklinks = 0; // TODO: Calculate from actual data
  const totalTechnicalIssues = 0; // TODO: Calculate from actual data

  // Calculate average position from recent SERP data
  const positionsWithData = recentSerpData.filter(item => item.current_position);
  const averagePosition = positionsWithData.length > 0 
    ? positionsWithData.reduce((sum, item) => sum + (item.current_position || 0), 0) / positionsWithData.length
    : 0;

  const dashboardData = {
    projects,
    recentActivity: recentSerpData.map(item => ({
      id: item.id,
      type: 'rank_change' as const,
      project_id: item.project_id,
      project_name: item.seo_projects?.name || 'Unknown Project',
      title: `Keyword: ${item.keyword}`,
      description: item.current_position 
        ? `Current position: #${item.current_position}` 
        : 'Position not available',
      timestamp: item.tracked_at,
      severity: item.current_position && item.current_position <= 10 ? 'low' as const : 'medium' as const,
    })),
    keyMetrics: {
      totalProjects,
      totalKeywords,
      averagePosition: Math.round(averagePosition * 10) / 10,
      totalBacklinks,
      technicalIssues: totalTechnicalIssues,
      contentMentions: 0, // TODO: Implement content mentions
    },
    alerts: [], // TODO: Implement alerts system
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SEO Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and optimize your website's search engine performance
            </p>
          </div>
          <ProjectSelector 
            currentProjectId={selectedProject?.id}
            onProjectChange={handleProjectChange}
          />
        </div>
      </div>

      <SEODashboard initialData={dashboardData} />
    </div>
  );
} 