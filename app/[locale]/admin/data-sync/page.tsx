'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { 
  PlusCircle, 
  RefreshCw, 
  Eye, 
  Store, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Package
} from 'lucide-react';

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

interface ShopifyStoreInfo {
  isConfigured: boolean;
  shopDomain?: string;
  shopName?: string;
  productCount?: number;
  lastSyncAt?: string;
  connectionStatus: 'connected' | 'error' | 'not_configured';
  error?: string;
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
  const [shopifyInfo, setShopifyInfo] = useState<ShopifyStoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringSync, setTriggeringSync] = useState<Record<string, boolean>>({});
  const [triggerError, setTriggerError] = useState<Record<string, string | null>>({});
  const [triggerSuccess, setTriggerSuccess] = useState<Record<string, string | null>>({});
  
  // Add data source form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    url: '',
    type: 'product_feed'
  });
  const [addingSource, setAddingSource] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  
  // Shopify product sync state
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{
    total: number;
    created: number;
    updated: number;
    errors: number;
  } | null>(null);

  // Article sync states
  const [syncingArticles, setSyncingArticles] = useState(false);
  const [articleSyncError, setArticleSyncError] = useState<string | null>(null);
  const [articleSyncSuccess, setArticleSyncSuccess] = useState<string | null>(null);
  const [articleSyncProgress, setArticleSyncProgress] = useState<{
    total: number;
    created: number;
    updated: number;
    errors: number;
  } | null>(null);
  
  // Reverse article sync states (app to Shopify)
  const [syncingToShopify, setSyncingToShopify] = useState(false);
  const [toShopifySyncError, setToShopifySyncError] = useState<string | null>(null);
  const [toShopifySyncSuccess, setToShopifySyncSuccess] = useState<string | null>(null);
  const [toShopifySyncProgress, setToShopifySyncProgress] = useState<{
    processed: number;
    created: number;
    updated: number;
    errors: number;
  } | null>(null);

  // Product sync to Shopify states (app to Shopify)
  const [syncingProductsToShopify, setSyncingProductsToShopify] = useState(false);
  const [productToShopifySyncError, setProductToShopifySyncError] = useState<string | null>(null);
  const [productToShopifySyncSuccess, setProductToShopifySyncSuccess] = useState<string | null>(null);
  const [productToShopifySyncProgress, setProductToShopifySyncProgress] = useState<{
    processed: number;
    created: number;
    updated: number;
    errors: number;
  } | null>(null);

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
      setDataSources([]);
    } finally {
      setLoading(false);
    }
  }, [session, isAdmin, authLoading, t]);

  const fetchShopifyInfo = useCallback(async () => {
    if (!session?.access_token || !isAdmin) {
      setShopifyLoading(false);
      return;
    }
    setShopifyLoading(true);
    try {
      const data = await fetchAdminApi('shopify/store-info', session.access_token);
      setShopifyInfo(data);
    } catch (err) {
      console.error('Failed to fetch Shopify info:', err);
      setShopifyInfo({
        isConfigured: false,
        connectionStatus: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setShopifyLoading(false);
    }
  }, [session, isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      fetchDataSources();
      fetchShopifyInfo();
    }
  }, [fetchDataSources, fetchShopifyInfo, authLoading]);

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
    } catch (err) {
      console.error(`Failed to trigger sync for ${sourceName}:`, err);
      setTriggerError(prev => ({...prev, [sourceId]: err instanceof Error ? err.message : t('errors.triggerFailed')}));
    } finally {
      setTriggeringSync(prev => ({...prev, [sourceId]: false}));
      setTimeout(() => {
        setTriggerSuccess(prev => ({...prev, [sourceId]: null}));
        setTriggerError(prev => ({...prev, [sourceId]: null}));
      }, 5000);
    }
  };

  const handleAddDataSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !isAdmin) {
      setAddError(t('errors.unauthorized'));
      return;
    }

    setAddingSource(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      const result = await fetchAdminApi('data-sources/add', session.access_token, {
        method: 'POST',
        body: JSON.stringify(addFormData),
      });

      if (result.success) {
        setAddSuccess(t('dataSources.addSuccess'));
        setAddFormData({ url: '', type: 'product_feed' });
        setShowAddForm(false);
        fetchDataSources();
      } else {
        setAddError(result.error || t('dataSources.addError'));
      }
    } catch (err) {
      console.error('Failed to add data source:', err);
      if (err instanceof Error && err.message.includes('already exists')) {
        setAddError(t('dataSources.urlExists'));
      } else {
        setAddError(err instanceof Error ? err.message : t('dataSources.addError'));
      }
    } finally {
      setAddingSource(false);
      setTimeout(() => {
        setAddSuccess(null);
        setAddError(null);
      }, 5000);
    }
  };

  const handleSyncShopifyProducts = async (options: { limit?: number; force?: boolean } = {}) => {
    if (!session?.access_token || !isAdmin) {
      setSyncError(t('errors.unauthorized'));
      return;
    }

    setSyncingProducts(true);
    setSyncError(null);
    setSyncSuccess(null);
    setSyncProgress(null);

    try {
      const result = await fetchAdminApi('shopify/sync-products', session.access_token, {
        method: 'POST',
        body: JSON.stringify({
          limit: options.limit || 50,
          force: options.force || false
        }),
      });

      if (result.success) {
        setSyncSuccess(result.message);
        setSyncProgress(result.stats);
        // Refresh Shopify info to get updated counts
        fetchShopifyInfo();
      } else {
        setSyncError(result.error || t('shopify.syncError'));
        if (result.stats) {
          setSyncProgress(result.stats);
        }
      }
    } catch (err) {
      console.error('Failed to sync Shopify products:', err);
      setSyncError(err instanceof Error ? err.message : t('shopify.syncError'));
    } finally {
      setSyncingProducts(false);
      setTimeout(() => {
        setSyncSuccess(null);
        setSyncError(null);
        setSyncProgress(null);
      }, 10000);
    }
  };

  const handleSyncShopifyArticles = async (options: { fullSync?: boolean } = {}) => {
    if (!session?.access_token || !isAdmin) {
      setArticleSyncError(t('errors.unauthorized'));
      return;
    }

    setSyncingArticles(true);
    setArticleSyncError(null);
    setArticleSyncSuccess(null);
    setArticleSyncProgress(null);

    try {
      const result = await fetchAdminApi('shopify/sync-articles', session.access_token, {
        method: 'POST',
        body: JSON.stringify({
          fullSync: options.fullSync || false
        }),
      });

      if (result.success) {
        setArticleSyncSuccess(result.message);
        setArticleSyncProgress(result.stats);
        // Refresh Shopify info to get updated counts
        fetchShopifyInfo();
      } else {
        setArticleSyncError(result.error || t('shopify.articleSync.syncError'));
        if (result.stats) {
          setArticleSyncProgress(result.stats);
        }
      }
    } catch (err) {
      console.error('Failed to sync Shopify articles:', err);
      setArticleSyncError(err instanceof Error ? err.message : t('shopify.articleSync.syncError'));
    } finally {
      setSyncingArticles(false);
      setTimeout(() => {
        setArticleSyncSuccess(null);
        setArticleSyncError(null);
        setArticleSyncProgress(null);
      }, 10000);
    }
  };

  const handleSyncToShopify = async () => {
    if (!session) {
      setToShopifySyncError('No session available');
      return;
    }

    setSyncingToShopify(true);
    setToShopifySyncError(null);
    setToShopifySyncSuccess(null);
    setToShopifySyncProgress(null);

    try {
      const result = await fetchAdminApi('shopify/sync-articles', session.access_token, {
        method: 'PUT',
      });

      setToShopifySyncSuccess(result.message);
      setToShopifySyncProgress(result.stats);
      
      // Refresh data sources
      await fetchDataSources();
    } catch (error) {
      console.error('Error syncing to Shopify:', error);
      setToShopifySyncError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSyncingToShopify(false);
      setTimeout(() => {
        setToShopifySyncSuccess(null);
        setToShopifySyncError(null);
        setToShopifySyncProgress(null);
      }, 10000);
    }
  };

  const handleSyncProductsToShopify = async () => {
    if (!session) {
      setProductToShopifySyncError('No session available');
      return;
    }

    setSyncingProductsToShopify(true);
    setProductToShopifySyncError(null);
    setProductToShopifySyncSuccess(null);
    setProductToShopifySyncProgress(null);

    try {
      const result = await fetchAdminApi('shopify/sync-products', session.access_token, {
        method: 'PUT',
      });

      setProductToShopifySyncSuccess(result.message);
      setProductToShopifySyncProgress(result.stats);
      
      // Refresh data sources
      await fetchDataSources();
    } catch (error) {
      console.error('Error syncing products to Shopify:', error);
      setProductToShopifySyncError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSyncingProductsToShopify(false);
      setTimeout(() => {
        setProductToShopifySyncSuccess(null);
        setProductToShopifySyncError(null);
        setProductToShopifySyncProgress(null);
      }, 10000);
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

  if (error && !dataSources.length && !shopifyInfo) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">{t('title')}</h1>
        <p className="text-red-400">{t('errorLoading', { message: error })}</p>
        <button 
          onClick={() => {
            fetchDataSources();
            fetchShopifyInfo();
          }}
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
        default: return 'bg-yellow-500';
      }
    }
    return 'bg-purple-500';
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">{t('title')}</h1>
        <button 
          onClick={() => {
            fetchDataSources();
            fetchShopifyInfo();
          }}
          disabled={loading || authLoading || shopifyLoading}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center transition-colors text-sm"
        >
          <RefreshCw size={16} className="mr-2" />
          {t('refreshList')}
        </button>
      </div>

      {/* Shopify Store Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Store className="w-6 h-6 text-green-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">{t('shopify.title')}</h2>
        </div>

        {shopifyLoading ? (
          <p className="text-gray-300">{t('shopify.loading')}</p>
        ) : shopifyInfo ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {getConnectionStatusIcon(shopifyInfo.connectionStatus)}
              <span className="text-white font-medium">
                {shopifyInfo.connectionStatus === 'connected' && t('shopify.connected')}
                {shopifyInfo.connectionStatus === 'error' && t('shopify.connectionError')}
                {shopifyInfo.connectionStatus === 'not_configured' && t('shopify.notConfigured')}
              </span>
            </div>

            {!shopifyInfo.isConfigured ? (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-md p-4">
                <p className="text-yellow-200 text-sm">
                  {t('shopify.configureInstructions')}
                </p>
              </div>
            ) : shopifyInfo.connectionStatus === 'connected' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-md p-4">
                    <p className="text-gray-400 text-sm">{t('shopify.shopName')}</p>
                    <p className="text-white font-medium">{shopifyInfo.shopName}</p>
                  </div>
                  <div className="bg-gray-700 rounded-md p-4">
                    <p className="text-gray-400 text-sm">{t('shopify.domain')}</p>
                    <p className="text-white font-medium">{shopifyInfo.shopDomain}</p>
                  </div>
                  <div className="bg-gray-700 rounded-md p-4">
                    <p className="text-gray-400 text-sm">{t('shopify.productCount')}</p>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-blue-400 mr-2" />
                      <p className="text-white font-medium">{shopifyInfo.productCount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-md p-4">
                    <p className="text-gray-400 text-sm">{t('shopify.lastSync')}</p>
                    <p className="text-white font-medium">
                      {shopifyInfo.lastSyncAt 
                        ? new Date(shopifyInfo.lastSyncAt).toLocaleString()
                        : t('shopify.never')
                      }
                    </p>
                  </div>
                </div>

                {/* Product Sync Section */}
                <div className="bg-gray-700 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">{t('shopify.productSync.title')}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSyncShopifyProducts({ limit: 50, force: false })}
                        disabled={syncingProducts}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md flex items-center transition-colors text-sm"
                      >
                        <RefreshCw size={16} className={`mr-2 ${syncingProducts ? 'animate-spin' : ''}`} />
                        {syncingProducts ? t('shopify.productSync.syncing') : t('shopify.productSync.syncProducts')}
                      </button>
                      <button
                        onClick={() => handleSyncShopifyProducts({ limit: 200, force: true })}
                        disabled={syncingProducts}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white rounded-md flex items-center transition-colors text-sm"
                      >
                        <RefreshCw size={16} className={`mr-2 ${syncingProducts ? 'animate-spin' : ''}`} />
                        {syncingProducts ? t('shopify.productSync.syncing') : t('shopify.productSync.fullSync')}
                      </button>
                      <button
                        onClick={handleSyncProductsToShopify}
                        disabled={syncingProductsToShopify}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-md flex items-center transition-colors text-sm"
                      >
                        <ExternalLink size={16} className={`mr-2 ${syncingProductsToShopify ? 'animate-spin' : ''}`} />
                        {syncingProductsToShopify ? t('shopify.reverseProductSync.syncing') : t('shopify.reverseProductSync.syncButton')}
                      </button>
                    </div>
                  </div>

                  {/* Sync Progress */}
                  {syncProgress && (
                    <div className="mb-4 bg-gray-600 rounded-md p-3">
                      <p className="text-white text-sm font-medium mb-2">{t('shopify.productSync.progress')}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">{t('shopify.productSync.total')}: </span>
                          <span className="text-white font-medium">{syncProgress.total}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.productSync.created')}: </span>
                          <span className="text-green-400 font-medium">{syncProgress.created}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.productSync.updated')}: </span>
                          <span className="text-blue-400 font-medium">{syncProgress.updated}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.productSync.errors')}: </span>
                          <span className="text-red-400 font-medium">{syncProgress.errors}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product to Shopify Sync Progress */}
                  {productToShopifySyncProgress && (
                    <div className="mb-4 bg-gray-600 rounded-md p-3">
                      <p className="text-white text-sm font-medium mb-2">{t('shopify.reverseProductSync.progress.titleAppToShopify')}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseProductSync.progress.processed')}: </span>
                          <span className="text-white font-medium">{productToShopifySyncProgress.processed}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseProductSync.progress.created')}: </span>
                          <span className="text-green-400 font-medium">{productToShopifySyncProgress.created}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseProductSync.progress.updated')}: </span>
                          <span className="text-blue-400 font-medium">{productToShopifySyncProgress.updated}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseProductSync.progress.errors')}: </span>
                          <span className="text-red-400 font-medium">{productToShopifySyncProgress.errors}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sync Messages */}
                  {syncError && (
                    <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-md p-3">
                      <p className="text-red-200 text-sm">{syncError}</p>
                    </div>
                  )}

                  {syncSuccess && (
                    <div className="mb-4 bg-green-900/20 border border-green-500/30 rounded-md p-3">
                      <p className="text-green-200 text-sm">{syncSuccess}</p>
                    </div>
                  )}

                  {/* Product to Shopify Sync Messages */}
                  {productToShopifySyncError && (
                    <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-md p-3">
                      <p className="text-red-200 text-sm">{productToShopifySyncError}</p>
                    </div>
                  )}

                  {productToShopifySyncSuccess && (
                    <div className="mb-4 bg-green-900/20 border border-green-500/30 rounded-md p-3">
                      <p className="text-green-200 text-sm">{productToShopifySyncSuccess}</p>
                    </div>
                  )}

                  <p className="text-gray-300 text-sm">{t('shopify.productSync.description')}</p>
                </div>

                {/* Article Sync Section */}
                <div className="bg-gray-700 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">{t('shopify.articleSync.title')}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSyncShopifyArticles()}
                        disabled={syncingArticles}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                      >
                        <RefreshCw size={16} className={`mr-2 ${syncingArticles ? 'animate-spin' : ''}`} />
                        {syncingArticles ? t('shopify.articleSync.syncing') : t('shopify.articleSync.syncButton')}
                      </button>
                      <button
                        onClick={handleSyncToShopify}
                        disabled={syncingToShopify}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                      >
                        <ExternalLink size={16} className={`mr-2 ${syncingToShopify ? 'animate-spin' : ''}`} />
                        {syncingToShopify ? t('shopify.reverseArticleSync.syncing') : t('shopify.reverseArticleSync.syncButton')}
                      </button>
                    </div>
                  </div>

                  {/* Article Sync Progress (Shopify to App) */}
                  {articleSyncProgress && (
                    <div className="mb-4 bg-gray-600 rounded-md p-3">
                      <p className="text-white text-sm font-medium mb-2">{t('shopify.articleSync.progress.titleShopifyToApp')}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">{t('shopify.articleSync.progress.total')}: </span>
                          <span className="text-white font-medium">{articleSyncProgress.total}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.articleSync.progress.created')}: </span>
                          <span className="text-green-400 font-medium">{articleSyncProgress.created}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.articleSync.progress.updated')}: </span>
                          <span className="text-blue-400 font-medium">{articleSyncProgress.updated}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.articleSync.progress.errors')}: </span>
                          <span className="text-red-400 font-medium">{articleSyncProgress.errors}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Article Sync Messages (Shopify to App) */}
                  {articleSyncError && (
                    <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-md p-3">
                      <p className="text-red-200 text-sm">{articleSyncError}</p>
                    </div>
                  )}
                  {articleSyncSuccess && (
                    <div className="mb-4 bg-green-900/20 border border-green-500/30 rounded-md p-3">
                      <p className="text-green-200 text-sm">{articleSyncSuccess}</p>
                    </div>
                  )}

                  {/* Reverse Article Sync Progress (App to Shopify) */}
                  {toShopifySyncProgress && (
                    <div className="mb-4 bg-gray-600 rounded-md p-3">
                      <p className="text-white text-sm font-medium mb-2">{t('shopify.reverseArticleSync.progress.titleAppToShopify')}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseArticleSync.progress.processed')}: </span>
                          <span className="text-white font-medium">{toShopifySyncProgress.processed}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseArticleSync.progress.created')}: </span>
                          <span className="text-green-400 font-medium">{toShopifySyncProgress.created}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseArticleSync.progress.updated')}: </span>
                          <span className="text-blue-400 font-medium">{toShopifySyncProgress.updated}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('shopify.reverseArticleSync.progress.errors')}: </span>
                          <span className="text-red-400 font-medium">{toShopifySyncProgress.errors}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Reverse Article Sync Messages (App to Shopify) */}
                  {toShopifySyncError && (
                    <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-md p-3">
                      <p className="text-red-200 text-sm">{toShopifySyncError}</p>
                    </div>
                  )}
                  {toShopifySyncSuccess && (
                    <div className="mb-4 bg-green-900/20 border border-green-500/30 rounded-md p-3">
                      <p className="text-green-200 text-sm">{toShopifySyncSuccess}</p>
                    </div>
                  )}

                  <p className="text-gray-300 text-sm">{t('shopify.articleSync.description')}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4">
                <p className="text-red-200 text-sm">{shopifyInfo.error}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Data Sources Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-white">{t('dataSources.title')}</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors text-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            {t('dataSources.addNew')}
          </button>
        </div>

        {/* Add Data Source Form */}
        {showAddForm && (
          <div className="mb-6 bg-gray-700 rounded-md p-4">
            <h3 className="text-lg font-medium text-white mb-3">{t('dataSources.addNew')}</h3>
            <p className="text-gray-300 text-sm mb-4">{t('dataSources.addNewDescription')}</p>
            
            <form onSubmit={handleAddDataSource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('dataSources.form.url')}
                </label>
                <input
                  type="url"
                  value={addFormData.url}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={t('dataSources.form.urlPlaceholder')}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('dataSources.form.type')}
                </label>
                <select
                  value={addFormData.type}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="product_feed">{t('dataSources.form.typeOptions.product_feed')}</option>
                  <option value="inventory_feed">{t('dataSources.form.typeOptions.inventory_feed')}</option>
                  <option value="customer_data">{t('dataSources.form.typeOptions.customer_data')}</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={addingSource}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md transition-colors"
                >
                  {addingSource ? t('dataSources.form.adding') : t('dataSources.form.add')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddFormData({ url: '', type: 'product_feed' });
                    setAddError(null);
                    setAddSuccess(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                >
                  {t('dataSources.form.cancel')}
                </button>
              </div>

              {addError && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3">
                  <p className="text-red-200 text-sm">{addError}</p>
                </div>
              )}

              {addSuccess && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-md p-3">
                  <p className="text-green-200 text-sm">{addSuccess}</p>
                </div>
              )}
            </form>
          </div>
        )}

        {error && <p className="text-red-400 mb-4">{t('errorFetchingSome', { message: error })}</p>}

        {dataSources.length === 0 && !loading ? (
          <p className="text-gray-400">{t('noSourcesFound')}</p>
        ) : (
          <div className="bg-gray-750 shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-700 text-xs text-gray-400 uppercase">
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
                  <tr key={source.id} className="border-b border-gray-600 hover:bg-gray-700 transition-colors">
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
                      {triggerError[source.id] && <p className="text-xs text-red-400 mb-1">Error: {triggerError[source.id]}</p>}
                      {triggerSuccess[source.id] && <p className="text-xs text-green-400 mb-1">{triggerSuccess[source.id]}</p>}
                      
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/data-sync/${source.id}`}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs flex items-center transition-colors"
                        >
                          <Eye size={14} className="mr-1" />
                          {t('viewDetails')}
                        </Link>
                        
                        {source.status === 'active' ? (
                          <button
                            onClick={() => handleTriggerSync(source.id, source.name || source.identifier)}
                            disabled={triggeringSync[source.id]}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded text-xs flex items-center transition-colors"
                          >
                            <RefreshCw size={14} className={`mr-1 ${triggeringSync[source.id] ? 'animate-spin' : ''}`} />
                            {triggeringSync[source.id] ? t('triggering') : t('triggerSync')}
                          </button>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500 text-gray-300 rounded text-xs" title={t('syncDisabledInactive')}>
                            {t('triggerSync')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 