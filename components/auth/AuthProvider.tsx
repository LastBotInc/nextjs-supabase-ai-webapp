'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  user: User | null
  isAdmin: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  error: null
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Add debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Add request caching
const REQUEST_CACHE = new Map<string, {data: any, timestamp: number}>()
const CACHE_DURATION = 15 * 60 * 1000 // Increased to 15 minutes
const AUTH_TIMEOUT = 15000 // Increased to 15 seconds
const SESSION_STORAGE_KEY = 'sb-session-state'
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds between retries

// Add error types
const enum AuthErrorType {
  TIMEOUT = 'TIMEOUT',
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Move retry counter inside component
  const retryCountRef = useRef(0)
  
  const [session, setSession] = useState<Session | null>(() => {
    // Try to restore session from storage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        try {
          const { data, timestamp } = JSON.parse(stored)
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data
          }
        } catch (e) {
          console.error('Error parsing stored session:', e)
        }
      }
    }
    return null
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)
  const latestRequestRef = useRef<AbortController | null>(null)
  const processingRef = useRef<string | null>(null)
  const adminStatusCacheRef = useRef<{[key: string]: {status: boolean, timestamp: number}}>({})
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const lastEventRef = useRef<string | null>(null)
  const lastUserIdRef = useRef<string | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Add request cache helper
  const getCachedRequest = useCallback(<T,>(key: string): T | null => {
    const cached = REQUEST_CACHE.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T
    }
    return null
  }, [])

  const setCachedRequest = useCallback(<T,>(key: string, data: T): void => {
    REQUEST_CACHE.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [])

  // Improved error handling
  const handleAuthError = useCallback((error: any): string => {
    if (error?.message?.includes('timeout')) {
      return AuthErrorType.TIMEOUT
    }
    if (error?.message?.includes('network')) {
      return AuthErrorType.NETWORK  
    }
    if (error?.status === 401) {
      return AuthErrorType.UNAUTHORIZED
    }
    return AuthErrorType.UNKNOWN
  }, [])

  // Store session in storage
  useEffect(() => {
    if (typeof window !== 'undefined' && session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        data: session,
        timestamp: Date.now()
      }))
    }
  }, [session])

  const startLoadingTimeout = useCallback(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    // Only start timeout if still loading
    if (!loading) return
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && loading) {
        console.warn('Auth loading timeout reached')
        setLoading(false)
        setError(AuthErrorType.TIMEOUT)
      }
    }, AUTH_TIMEOUT)

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [loading])

  // Effect to handle loading timeout
  useEffect(() => {
    const cleanup = startLoadingTimeout()
    return cleanup
  }, [loading, startLoadingTimeout])

  const fetchAdminStatus = useCallback(async (userId: string) => {
    // Skip if already fetching for the same user
    if (lastUserIdRef.current === userId) return
    lastUserIdRef.current = userId

    // Check memory cache first
    const cachedStatus = adminStatusCacheRef.current[userId]
    if (cachedStatus && (Date.now() - cachedStatus.timestamp) < CACHE_DURATION) {
      setIsAdmin(cachedStatus.status)
      setError(null)
      setLoading(false)
      return
    }

    // Check request cache
    const cacheKey = `admin-status-${userId}`
    const cachedRequest = getCachedRequest<boolean>(cacheKey)
    if (cachedRequest !== null) {
      setIsAdmin(cachedRequest)
      setError(null)
      setLoading(false)
      return
    }

    try {
      // Cancel any ongoing request
      if (latestRequestRef.current) {
        latestRequestRef.current.abort()
      }

      const controller = new AbortController()
      latestRequestRef.current = controller
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal)

      if (!isMountedRef.current || controller.signal.aborted) return

      if (error) throw error
      
      if (data === null) {
        setError('Profile not found')
        setIsAdmin(false)
        return
      }

      const adminStatus = data.is_admin ?? false
      setIsAdmin(adminStatus)
      setError(null)
      
      // Cache the result in memory
      adminStatusCacheRef.current[userId] = {
        status: adminStatus,
        timestamp: Date.now()
      }

      // Cache the request
      setCachedRequest(cacheKey, adminStatus)

    } catch (error: any) {
      if (isMountedRef.current && (!latestRequestRef.current || !latestRequestRef.current.signal.aborted)) {
        console.error('Error fetching admin status:', error)
        const errorType = handleAuthError(error)
        setError(errorType)
        setIsAdmin(false)
      }
    } finally {
      if (latestRequestRef.current?.signal.aborted) return
      
      if (isMountedRef.current) {
        setLoading(false)
      }
      
      latestRequestRef.current = null
      lastUserIdRef.current = null
    }
  }, [supabase, getCachedRequest, setCachedRequest, handleAuthError])

  const handleAuthStateChange = useCallback(async (session: Session | null, event: AuthChangeEvent = 'INITIAL_SESSION') => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return

    // Skip duplicate events
    const eventId = `${event}-${session?.user?.id ?? 'none'}`
    if (lastEventRef.current === eventId) return
    lastEventRef.current = eventId

    // Reset loading state for new auth events
    if (event !== 'INITIAL_SESSION') {
      setLoading(true)
      startLoadingTimeout()
    }

    setSession(session)
    
    if (!session?.user) {
      setIsAdmin(false)
      setError(null)
      setLoading(false)
      return
    }

    try {
      await fetchAdminStatus(session.user.id)
      // Reset retry counter on success
      retryCountRef.current = 0
    } catch (error) {
      console.error('Auth state change error:', error)
      // Implement retry logic
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++
        setTimeout(() => {
          handleAuthStateChange(session, event)
        }, RETRY_DELAY)
      } else {
        setError('Authentication failed after retries. Please refresh the page.')
        setLoading(false)
      }
    }
  }, [fetchAdminStatus, startLoadingTimeout])

  useEffect(() => {
    let mounted = true
    isMountedRef.current = true

    const initialize = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          console.error('Error getting initial session:', sessionError)
          setError('Error initializing authentication')
          setLoading(false)
          return
        }

        // Handle initial session
        await handleAuthStateChange(initialSession)

        // Subscribe to auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            if (mounted) {
              await handleAuthStateChange(session, event)
            }
          }
        )

        if (mounted) {
          subscriptionRef.current = subscription
        } else {
          subscription.unsubscribe()
        }
      } catch (error) {
        if (mounted) {
          console.error('Unexpected auth error:', error)
          setError('Unexpected authentication error')
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
      isMountedRef.current = false
      if (latestRequestRef.current) {
        latestRequestRef.current.abort()
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [supabase.auth, handleAuthStateChange])

  const value = useMemo(() => ({
    session,
    loading,
    isAuthenticated: !!session?.user,
    user: session?.user ?? null,
    isAdmin,
    error
  }), [session, loading, isAdmin, error])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
