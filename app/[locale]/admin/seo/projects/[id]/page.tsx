'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { SEOProject } from '@/types/seo';
import { Link } from '@/app/i18n/navigation';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  GlobeAltIcon,
  CalendarIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function SEOProjectDetailPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<SEOProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.user || !isAdmin || !projectId) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('seo_projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Project not found');
          } else {
            throw error;
          }
          return;
        }

        setProject(data);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProject();
    }
  }, [session, isAdmin, authLoading, projectId]);

  const handleDelete = async () => {
    if (!project || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('seo_projects')
        .delete()
        .eq('id', project.id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      router.push('/admin/seo/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
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
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You need admin access to view this page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/admin/seo/projects"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/admin/seo/projects"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Project Not Found</h1>
          <p className="mt-2 text-gray-600">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/admin/seo/projects"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/admin/seo/projects/${project.id}/edit`)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Project
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h1>
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  <span>{project.domain}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {project.description && (
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Project Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/seo/keywords"
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <MagnifyingGlassIcon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">Keyword Research</h3>
              <p className="text-sm text-green-600 dark:text-green-400">Find new keywords</p>
            </div>
          </Link>
          
          <Link
            href="/admin/seo/backlinks"
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <LinkIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <h3 className="font-medium text-purple-900 dark:text-purple-100">Backlink Analysis</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">Analyze backlinks</p>
            </div>
          </Link>
          
          <Link
            href="/admin/seo/technical"
            className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <CogIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-100">Technical Audit</h3>
              <p className="text-sm text-orange-600 dark:text-orange-400">Check site health</p>
            </div>
          </Link>
          
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Analytics</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Keywords Tracked</span>
              <span className="font-medium text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Backlinks Found</span>
              <span className="font-medium text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Technical Issues</span>
              <span className="font-medium text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(project.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by researching keywords or analyzing backlinks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 