'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { SEOProject } from '@/types/seo';
import { Link } from '@/app/i18n/navigation';
import { PlusIcon, GlobeAltIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function SEOProjectsPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const [projects, setProjects] = useState<SEOProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user || !isAdmin) {
        if (!authLoading) setError('Unauthorized access');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('seo_projects')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProjects(data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProjects();
    }
  }, [session, isAdmin, authLoading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SEO Projects
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading projects...
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
            SEO Projects
          </h1>
          <p className="mt-2 text-red-600 dark:text-red-400">
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SEO Projects
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your SEO projects and track their performance
          </p>
        </div>
        <Link
          href="/admin/seo/projects/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first SEO project to start tracking keywords, backlinks, and technical issues.
          </p>
          <Link
            href="/admin/seo/projects/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {project.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <GlobeAltIcon className="h-4 w-4 mr-1" />
                    {project.domain}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Created {formatDate(project.created_at)}
                  </div>
                </div>
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/admin/seo/projects/${project.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 