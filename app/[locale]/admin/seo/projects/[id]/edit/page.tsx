'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { SEOProject } from '@/types/seo';
import { Link } from '@/app/i18n/navigation';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EditSEOProjectPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<SEOProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
  });

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
        setFormData({
          name: data.name,
          domain: data.domain,
          description: data.description || '',
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || saving) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('seo_projects')
        .update({
          name: formData.name,
          domain: formData.domain,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      router.push(`/admin/seo/projects/${project.id}`);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSaving(false);
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
            href={`/admin/seo/projects/${projectId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Project
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
      <div className="mb-8">
        <Link
          href={`/admin/seo/projects/${project.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Project
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your SEO project details
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain *
            </label>
            <input
              type="url"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Describe your SEO project..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link
              href={`/admin/seo/projects/${project.id}`}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.name.trim() || !formData.domain.trim()}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 