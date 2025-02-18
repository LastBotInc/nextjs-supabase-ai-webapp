'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useLoadingWithTimeout } from '@/hooks/useLoadingWithTimeout'

const USERS_PER_PAGE = 10

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { session, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Admin.users')
  const { loading, startLoading, stopLoading } = useLoadingWithTimeout({
    timeout: 10000,
    onTimeout: () => setError(new Error('Request timed out. Please try again.'))
  })

  // Keep stable references to values needed in fetchUsers
  const pageRef = useRef(page)
  const sessionRef = useRef(session)
  const isAdminRef = useRef(isAdmin)

  // Update refs when values change
  useEffect(() => {
    pageRef.current = page
    sessionRef.current = session
    isAdminRef.current = isAdmin
  }, [page, session, isAdmin])

  const fetchUsers = useCallback(async () => {
    const currentSession = sessionRef.current
    const currentIsAdmin = isAdminRef.current
    
    if (!currentSession?.user || !currentIsAdmin) return
    
    try {
      startLoading()
      setError(null)
      const response = await fetch(`/api/users?page=${pageRef.current}&perPage=${USERS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { users: userList } = await response.json()
      setUsers(userList || [])
      setHasMore(userList?.length === USERS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error as Error)
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading]) // Stable dependencies

  useEffect(() => {
    // Only fetch users if we're authenticated and admin
    if (!authLoading && session?.user && isAdmin) {
      fetchUsers()
    }
  }, [authLoading, session?.user?.id, isAdmin, page]) // Remove fetchUsers from dependencies, add specific session identifier

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!session?.user || !isAdmin)) {
      router.replace(`/${locale}/auth/sign-in?next=${encodeURIComponent(`/${locale}/admin/users`)}`)
    }
  }, [session, isAdmin, authLoading, router, locale])

  // Show loading while checking auth or fetching users
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
            onClick={() => fetchUsers()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('created')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lastSignIn')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {user.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : t('never')}
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
          {t('previous')}
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {t('page')} {page}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('next')}
        </button>
      </div>
    </div>
  )
} 