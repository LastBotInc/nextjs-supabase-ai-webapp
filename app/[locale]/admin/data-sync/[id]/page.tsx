'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { Link as IntlLink } from '@/app/i18n/navigation'; // For locale-aware back link
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface DataSource {
  id: string;
  name: string | null;
  identifier: string;
  feed_url: string;
  feed_type: string;
  status: string;
  error_message: string | null;
  detected_schema: Record<string, any> | null;
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

export default function DataSourceDetailPage({ params }: { params: { locale: string; id: string } }) {
  const t = useTranslations('Admin.DataSync');
  const { session, loading: authLoading, isAdmin } = useAuth();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringSync, setTriggeringSync] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [triggerSuccess, setTriggerSuccess] = useState<string | null>(null);
  
  const dataSourceId = params.id;

  const fetchDataSourceDetail = useCallback(async () => {
    if (!session?.access_token || !isAdmin) {
      if (!authLoading) setError(t('errors.unauthorized'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminApi(`data-sources/${dataSourceId}`, session.access_token);
      setDataSource(data);
    } catch (err) {
      console.error(`Failed to fetch data source ${dataSourceId}:`, err);
      setError(err instanceof Error ? err.message : t('errors.fetchDetailFailed'));
    } finally {
      setLoading(false);
    }
  }, [session, isAdmin, authLoading, dataSourceId, t]);

  useEffect(() => {
    if (!authLoading) {
        fetchDataSourceDetail();
    }
  }, [fetchDataSourceDetail, authLoading]);

  const handleTriggerSync = async () => {
    if (!session?.access_token || !isAdmin || !dataSource) {
      setTriggerError(t('errors.unauthorizedOrNoSource'));
      return;
    }
    setTriggeringSync(true);
    setTriggerError(null);
    setTriggerSuccess(null);

    try {
      const result = await fetchAdminApi(`data-sources/${dataSource.id}/trigger-sync`, session.access_token, {
        method: 'POST',
      });
      setTriggerSuccess(result.message || t('syncTriggeredSuccessfully', { name: dataSource.name || dataSource.identifier }));
       // Re-fetch details to see updated status/timestamps
      await fetchDataSourceDetail();
    } catch (err) {
      console.error(`Failed to trigger sync for ${dataSource.name || dataSource.identifier}:`, err);
      setTriggerError(err instanceof Error ? err.message : t('errors.triggerFailed'));
    } finally {
      setTriggeringSync(false);
      setTimeout(() => {
        setTriggerSuccess(null);
        setTriggerError(null);
      }, 5000); // Clear message after 5 seconds
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">{t('detail.loadingTitle')}</h1>
        <p className="text-gray-300">{t('detail.loadingDetail')}</p>
      </div>
    );
  }

  if (error || !dataSource) {
    return (
      <div className="p-6">
        <IntlLink href="/admin/data-sync" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft size={18} className="mr-2" />
          {t('backToList')}
        </IntlLink>
        <h1 className="text-2xl font-semibold text-white mb-6">
          {error ? t('detail.errorTitle') : t('detail.notFoundTitle')}
        </h1>
        <p className="text-red-400">{error || t('detail.notFoundMessage')}</p>
        <button 
            onClick={fetchDataSourceDetail}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors"
            disabled={authLoading}
        >
            <RefreshCw size={18} className="mr-2" />
            {t('retry')}
        </button>
      </div>
    );
  }

  const DetailItem = ({ labelKey, value }: { labelKey: string; value: string | null | undefined | number | React.ReactNode }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-400">{t(labelKey)}</dt>
      <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 break-words">
        {value === null || value === undefined || value === '' ? <span className="italic text-gray-500">{t('notAvailable')}</span> : value}
      </dd>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <IntlLink href="/admin/data-sync" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 text-sm">
          <ArrowLeft size={16} className="mr-2" />
          {t('backToList')}
        </IntlLink>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-white">{dataSource.name || dataSource.identifier}</h1>
                <p className="text-sm text-gray-400">{t('detail.showingDetailsFor', { id: dataSource.identifier })}</p>
            </div>
            <button
                onClick={handleTriggerSync}
                disabled={triggeringSync || dataSource.status === 'inactive'}
                className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center 
                    ${dataSource.status === 'inactive' 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50'}`}
                 title={dataSource.status === 'inactive' ? t('syncDisabledInactive') : t('triggerSyncNow')}
            >
                <RefreshCw size={16} className={`mr-2 ${triggeringSync ? 'animate-spin' : ''}`} />
                {triggeringSync ? t('triggering') : t('triggerSyncNow')}
            </button>
        </div>
        {triggerError && <p className="mt-2 text-sm text-red-400">Error: {triggerError}</p>}
        {triggerSuccess && <p className="mt-2 text-sm text-green-400">{triggerSuccess}</p>}
      </div>

      <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-white">{t('detail.sourceInformation')}</h3>
        </div>
        <div className="border-t border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-700">
            <DetailItem labelKey="detail.labels.id" value={dataSource.id} />
            <DetailItem labelKey="detail.labels.name" value={dataSource.name} />
            <DetailItem labelKey="detail.labels.identifier" value={dataSource.identifier} />
            <DetailItem labelKey="detail.labels.feedUrl" value={dataSource.feed_url} />
            <DetailItem labelKey="detail.labels.feedType" value={dataSource.feed_type} />
            <DetailItem labelKey="detail.labels.status" value={<span className={`px-2 py-0.5 text-xs font-medium rounded-full text-white ${dataSource.status === 'active' ? 'bg-green-500' : dataSource.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'}`}>{dataSource.status}</span>} />
            <DetailItem labelKey="detail.labels.errorMessage" value={dataSource.error_message ? <pre className="whitespace-pre-wrap text-red-400 text-xs">{dataSource.error_message}</pre> : null} />
            <DetailItem labelKey="detail.labels.lastFetched" value={dataSource.last_fetched_at ? new Date(dataSource.last_fetched_at).toLocaleString() : null} />
            <DetailItem labelKey="detail.labels.lastSchemaUpdate" value={dataSource.last_schema_update_at ? new Date(dataSource.last_schema_update_at).toLocaleString() : null} />
            <DetailItem labelKey="detail.labels.createdAt" value={new Date(dataSource.created_at).toLocaleString()} />
            <DetailItem labelKey="detail.labels.updatedAt" value={new Date(dataSource.updated_at).toLocaleString()} />
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 px-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-400">{t('detail.labels.detectedSchema')}</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                {dataSource.detected_schema ? (
                  <pre className="bg-gray-900 p-3 rounded-md text-xs whitespace-pre-wrap overflow-x-auto max-h-96">{JSON.stringify(dataSource.detected_schema, null, 2)}</pre>
                ) : (
                  <span className="italic text-gray-500">{t('notAvailable')}</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Placeholder for Sync History/Logs - Future implementation */}
      {/* <div className="mt-8 bg-gray-800 shadow-xl rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-white">{t('detail.syncHistory')}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-400">{t('detail.syncHistoryComingSoon')}</p>
        </div>
      </div> */}
    </div>
  );
} 