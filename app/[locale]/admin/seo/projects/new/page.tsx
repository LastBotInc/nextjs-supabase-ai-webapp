'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from '@/app/i18n/navigation';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewSEOProjectPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user || !isAdmin) {
      setError('Unauthorized access');
      return;
    }

    if (!formData.name.trim() || !formData.domain.trim()) {
      setError('Name and domain are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: createError } = await supabase
        .from('seo_projects')
        .insert({
          user_id: session.user.id,
          name: formData.name.trim(),
          domain: formData.domain.trim(),
          description: formData.description.trim() || null,
          settings: {}
        })
        .select()
        .single();

      if (createError) throw createError;

      // Redirect to the new project with proper locale handling
      router.push(`/admin/seo/projects/${data.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <Link
          href="/admin/seo/projects"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New SEO Project
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Set up a new project to track keywords, backlinks, and technical SEO metrics
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., My Website SEO"
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain *
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., example.com"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter the domain without http:// or https://
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Optional description of this SEO project..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/seo/projects"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 