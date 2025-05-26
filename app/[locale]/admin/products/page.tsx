'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useLoadingWithTimeout } from '@/hooks/useLoadingWithTimeout'
import { X, Package, Tag, Calendar, ExternalLink } from 'lucide-react'

const PRODUCTS_PER_PAGE = 20

interface Product {
  id: string
  title: string
  description_html: string | null
  vendor: string | null
  product_type: string | null
  status: string
  shopify_product_id: number
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
  product_images?: ProductImage[]
}

interface ProductVariant {
  id: string
  title: string
  price: number
  sku: string | null
  inventory_quantity: number
  shopify_variant_id: number
}

interface ProductImage {
  id: string
  url: string
  alt_text: string | null
  position: number
}

interface ProductCardProps {
  product: Product
  onClose: () => void
}

function ProductCard({ product, onClose }: ProductCardProps) {
  const t = useTranslations('Admin.products')
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  const { session } = useAuth()

  const fetchVariants = useCallback(async () => {
    if (!session?.access_token) return
    
    try {
      setLoadingVariants(true)
      const response = await fetch(`/api/admin/products/${product.id}/variants`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVariants(data.variants || [])
      }
    } catch (error) {
      console.error('Error fetching variants:', error)
    } finally {
      setLoadingVariants(false)
    }
  }, [product.id, session?.access_token])

  useEffect(() => {
    fetchVariants()
  }, [fetchVariants])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('card.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Primary Image */}
              {product.product_images && product.product_images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={product.product_images[0].url}
                      alt={product.product_images[0].alt_text || product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Gallery */}
                  {product.product_images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.product_images.slice(1, 5).map((image) => (
                        <div key={image.id} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.alt_text || product.title}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                  <a
                    href={`https://admin.shopify.com/store/lastbot-dev/products/${product.shopify_product_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{t('card.viewInShopify')}</span>
                  </a>
                </div>
              </div>

              {product.description_html && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('card.description')}
                  </h4>
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description_html }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Metadata */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.vendor')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {product.vendor || '-'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.type')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {product.product_type || '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.shopifyId')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {product.shopify_product_id}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.internalId')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white font-mono text-xs">
                      {product.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.created')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(product.created_at)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.updated')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(product.updated_at)}
                    </p>
                  </div>
                </div>

                {/* Image Count */}
                {product.product_images && product.product_images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('card.images')}
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {product.product_images.length} {product.product_images.length === 1 ? 'image' : 'images'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-5 w-5 text-gray-500" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('card.variants')} ({variants.length})
              </h4>
            </div>

            {loadingVariants ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" text={t('card.loadingVariants')} />
              </div>
            ) : variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('card.variantTitle')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('card.price')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('card.sku')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('card.inventory')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('card.shopifyVariantId')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {variant.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                          {formatPrice(variant.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {variant.sku || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {variant.inventory_quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {variant.shopify_variant_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t('card.noVariants')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { session, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Admin.products')
  const { loading, startLoading, stopLoading } = useLoadingWithTimeout({
    timeout: 10000,
    onTimeout: () => setError(new Error('Request timed out. Please try again.'))
  })

  // Keep stable references to values needed in fetchProducts
  const pageRef = useRef(page)
  const sessionRef = useRef(session)
  const isAdminRef = useRef(isAdmin)

  // Update refs when values change
  useEffect(() => {
    pageRef.current = page
    sessionRef.current = session
    isAdminRef.current = isAdmin
  }, [page, session, isAdmin])

  const fetchProducts = useCallback(async () => {
    const currentSession = sessionRef.current
    const currentIsAdmin = isAdminRef.current
    
    if (!currentSession?.user || !currentIsAdmin) return
    
    try {
      startLoading()
      setError(null)
      const response = await fetch(`/api/admin/products?page=${pageRef.current}&perPage=${PRODUCTS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { products: productList, total } = await response.json()
      setProducts(productList || [])
      setTotalCount(total || 0)
      setHasMore(productList?.length === PRODUCTS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(error as Error)
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  useEffect(() => {
    // Only fetch products if we're authenticated and admin
    if (!authLoading && session?.user && isAdmin) {
      fetchProducts()
    }
  }, [authLoading, session?.user?.id, isAdmin, page])

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!session?.user || !isAdmin)) {
      router.replace(`/${locale}/auth/sign-in?next=${encodeURIComponent(`/${locale}/admin/products`)}`)
    }
  }, [session, isAdmin, authLoading, router, locale])

  // Show loading while checking auth or fetching products
  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner size="lg" text={t('loading')} className="mt-8" />
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!session?.user || !isAdmin) {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error.message}</p>
          <button
            onClick={() => fetchProducts()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return '-'
    const plainText = text.replace(/<[^>]*>/g, '') // Remove HTML tags
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText
  }

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleCloseCard = () => {
    setSelectedProduct(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {t('description', { count: totalCount })}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('table.vendor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('table.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('table.shopifyId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('table.updated')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  onClick={() => handleRowClick(product)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.title}
                      </div>
                      {product.description_html && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {truncateText(product.description_html, 80)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.vendor || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.product_type || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : product.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {product.shopify_product_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(product.updated_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('pagination.previous')}
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {t('pagination.page', { page, total: Math.ceil(totalCount / PRODUCTS_PER_PAGE) })}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('pagination.next')}
        </button>
      </div>

      {/* Product Card Modal */}
      {selectedProduct && (
        <ProductCard 
          product={selectedProduct} 
          onClose={handleCloseCard}
        />
      )}
    </div>
  )
} 