'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { CogIcon } from '@heroicons/react/24/outline';

export default function TechnicalAuditPage() {
  const t = useTranslations('Admin.SEO');
  const { session, loading: authLoading, isAdmin } = useAuth();

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
          Technical SEO Audit
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Analyze your website's technical SEO health and performance
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Technical Audit Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This feature will provide comprehensive technical SEO audits including page speed, mobile-friendliness, crawlability, and more.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            🚧 This page is under development and will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
} 