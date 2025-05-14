'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client'; // For client-side token
import Link from 'next/link'; // Using Next.js Link for client-side nav
import { PlusCircle, RefreshCw, Eye } from 'lucide-react';

interface DataSource {
  id: string;
  name: string | null;
  identifier: string;
  feed_url: string;
  feed_type: string;
  status: string | null;
  error_message: string | null;
  last_fetched_at: string | null;
  last_schema_update_at: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchAdminApi(endpoint: string, token: string, options?: RequestInit) {
  const response = await fetch(`/api/admin/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
    console.error('Admin API Error:', response.status, errorData);
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}

export default function DataSyncAdminPage() {
  const t = useTranslations('Admin.DataSync');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringSync, setTriggeringSync] = useState<Record<string, boolean>>({});
  const [triggerError, setTriggerError] = useState<Record<string, string | null>>({});
  const [triggerSuccess, setTriggerSuccess] = useState<Record<string, string | null>>({});

  const fetchDataSources = useCallback(async () => {
    if (!session?.access_token || !isAdmin) {
      if (!authLoading) setError(t('errors.unauthorized'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminApi('data-sources', session.access_token);
      setDataSources(data || []);
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
      setDataSources([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [session, isAdmin, authLoading, t]);

  useEffect(() => {
    if (!authLoading) { // Only fetch if auth state is resolved
        fetchDataSources();
    }
  }, [fetchDataSources, authLoading]);

  const handleTriggerSync = async (sourceId: string, sourceName: string) => {
    if (!session?.access_token || !isAdmin) {
      setTriggerError(prev => ({...prev, [sourceId]: t('errors.unauthorized')}));
      return;
    }
    setTriggeringSync(prev => ({...prev, [sourceId]: true}));
    setTriggerError(prev => ({...prev, [sourceId]: null}));
    setTriggerSuccess(prev => ({...prev, [sourceId]: null}));

    try {
      const result = await fetchAdminApi(`data-sources/${sourceId}/trigger-sync`, session.access_token, {
        method: 'POST',
      });
      setTriggerSuccess(prev => ({...prev, [sourceId]: result.message || t('syncTriggeredSuccessfully', { name: sourceName }) }));
      // Optionally re-fetch data sources to update status, or rely on polling/SSE for updates
      // For now, we'll just show a success message.
    } catch (err) {
      console.error(`Failed to trigger sync for ${sourceName}:`, err);
      setTriggerError(prev => ({...prev, [sourceId]: err instanceof Error ? err.message : t('errors.triggerFailed')}));
    } finally {
      setTriggeringSync(prev => ({...prev, [sourceId]: false}));
      setTimeout(() => {
        setTriggerSuccess(prev => ({...prev, [sourceId]: null}));
        setTriggerError(prev => ({...prev, [sourceId]: null}));
      }, 5000); // Clear message after 5 seconds
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">{t('title')}</h1>
        <p className="text-gray-300">{t('loadingSources')}</p>
      </div>
    );
  }

  if (error && !dataSources.length) { // Show main error only if no data is present
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">{t('title')}</h1>
        <p className="text-red-400">{t('errorLoading', { message: error })}</p>
        <button 
            onClick={fetchDataSources}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors"
        >
            <RefreshCw size={18} className="mr-2" />
            {t('retry')}
        </button>
      </div>
    );
  }
  
  const getStatusColor = (status: string | null) => {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'active': return 'bg-green-500';
        case 'inactive': return 'bg-gray-500';
        case 'error': return 'bg-red-500';
        default: return 'bg-yellow-500'; // For unexpected or new string statuses
      }
    }
    return 'bg-purple-500'; // Fallback for null, undefined, or non-string status (e.g., 'Unknown')
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">{t('title')}</h1>
        <div>
            <button 
                onClick={fetchDataSources}
                disabled={loading || authLoading}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center transition-colors mr-2 text-sm"
            >
                <RefreshCw size={16} className="mr-2" />
                {t('refreshList')}
            </button>
            {/* <Link href="/admin/data-sync/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors text-sm">
                <PlusCircle size={18} className="mr-2" />
                {t('addNewSource')}
            </Link> */}
        </div>
      </div>

      {error && <p className="text-red-400 mb-4">{t('errorFetchingSome', { message: error })}</p>} 

      {dataSources.length === 0 && !loading && (
        <p className="text-gray-400">{t('noSourcesFound')}</p>
      )}

      {dataSources.length > 0 && (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-750 text-xs text-gray-400 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">{t('table.name')}</th>
                <th scope="col" className="px-6 py-3">{t('table.identifier')}</th>
                <th scope="col" className="px-6 py-3">{t('table.type')}</th>
                <th scope="col" className="px-6 py-3">{t('table.status')}</th>
                <th scope="col" className="px-6 py-3">{t('table.lastFetched')}</th>
                <th scope="col" className="px-6 py-3 text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((source) => (
                <tr key={source.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    <Link href={`/admin/data-sync/${source.id}`} className="hover:underline">
                        {source.name || source.identifier}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{source.identifier}</td>
                  <td className="px-6 py-4">{source.feed_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(source.status)}`}>
                      {source.status || t('unknownStatus')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {source.last_fetched_at ? new Date(source.last_fetched_at).toLocaleString() : t('never')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {triggerError[source.id] && <p className="text-xs text-red-400">Error: {triggerError[source.id]}</p>}
                    {triggerSuccess[source.id] && <p className="text-xs text-green-400">{triggerSuccess[source.id]}</p>}
                    <button
                      onClick={() => handleTriggerSync(source.id, source.name || source.identifier)}
                      disabled={triggeringSync[source.id] || source.status === 'inactive'}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center 
                        ${source.status === 'inactive' 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50'}`}
                      title={source.status === 'inactive' ? t('syncDisabledInactive') : t('triggerSyncNow')}
                    >
                      <RefreshCw size={14} className={`mr-1.5 ${triggeringSync[source.id] ? 'animate-spin' : ''}`} />
                      {triggeringSync[source.id] ? t('triggering') : t('triggerSync')}
                    </button>
                    <Link 
                        href={`/admin/data-sync/${source.id}`}
                        className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded-md flex items-center transition-colors"
                    >
                        <Eye size={14} className="mr-1.5" />
                        {t('viewDetails')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 