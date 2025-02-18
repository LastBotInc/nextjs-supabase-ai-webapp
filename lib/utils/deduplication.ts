'use client'

import { useEffect, useRef, useState, DependencyList } from 'react'

// Global request cache with timeout and shared storage
interface CacheEntry {
  promise: Promise<any>
  timestamp: number
  data?: {
    value: any
    status: number
    ok: boolean
    headers: Record<string, string>
  }
}

// Use localStorage to share cache between components
const CACHE_KEY_PREFIX = 'dedup_cache_'
const CACHE_DURATION = 5000 // 5 seconds cache duration

// In-memory cache for promises
const clientRequestCache = new Map<string, CacheEntry>()

// Function to create a cache key from request info
function createCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
  const url = input instanceof URL ? input.toString() : input.toString()
  const method = init?.method || 'GET'
  const body = init?.body ? JSON.stringify(init.body) : ''
  return `${method}:${url}:${body}`
}

// Load cached data from localStorage
function loadCachedData(cacheKey: string): CacheEntry['data'] | null {
  try {
    const item = localStorage.getItem(CACHE_KEY_PREFIX + cacheKey)
    if (!item) return null

    const cached = JSON.parse(item)
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY_PREFIX + cacheKey)
      return null
    }
    return cached.data
  } catch {
    return null
  }
}

// Save data to localStorage
function saveCacheData(cacheKey: string, data: CacheEntry['data']) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch {
    // Ignore storage errors
  }
}

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now()
  
  // Clean memory cache
  for (const [key, entry] of clientRequestCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      clientRequestCache.delete(key)
    }
  }

  // Clean localStorage cache
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const item = localStorage.getItem(key)
        if (item) {
          const { timestamp } = JSON.parse(item)
          if (now - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key)
          }
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
}

// Create a response-like object
function createResponseObject(data: CacheEntry['data']) {
  if (!data) {
    throw new Error('No data available')
  }

  return {
    ok: data.ok,
    status: data.status,
    headers: new Headers(data.headers),
    json: () => Promise.resolve(data.value),
    // Other methods throw errors as they're not needed
    text: () => Promise.reject(new Error('Only JSON is supported')),
    blob: () => Promise.reject(new Error('Only JSON is supported')),
    arrayBuffer: () => Promise.reject(new Error('Only JSON is supported')),
    formData: () => Promise.reject(new Error('Only JSON is supported')),
    clone: () => createResponseObject(data)
  }
}

// Deduplicating fetch wrapper for client-side
export async function dedupingFetch(input: RequestInfo | URL, init?: RequestInit) {
  const cacheKey = createCacheKey(input, init)
  const now = Date.now()
  
  // Clean expired entries
  cleanExpiredCache()

  // First check localStorage for cached data
  const cachedData = loadCachedData(cacheKey)
  if (cachedData) {
    return createResponseObject(cachedData)
  }

  // Then check memory cache
  const cachedEntry = clientRequestCache.get(cacheKey)
  if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION)) {
    if (cachedEntry.data) {
      return createResponseObject(cachedEntry.data)
    }
    return cachedEntry.promise
  }

  let cacheEntry: CacheEntry | undefined

  // Create new promise that includes JSON parsing
  const responsePromise = (async () => {
    const response = await fetch(input, init)
    
    try {
      // Clone response before reading
      const clonedResponse = response.clone()
      
      // Parse JSON
      const value = await response.json()
      
      // Create cache data
      const data = {
        value,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      }
      
      // Update both memory and localStorage cache
      if (cacheEntry) {
        cacheEntry.data = data
        saveCacheData(cacheKey, data)
      }

      return createResponseObject({ ...data })
    } catch (error) {
      // If JSON parsing fails, create error response
      const data = {
        value: { data: null, error: 'Failed to parse JSON response' },
        status: 500,
        ok: false,
        headers: {}
      }
      return createResponseObject(data)
    }
  })()

  // Create and store the cache entry
  cacheEntry = {
    promise: responsePromise,
    timestamp: now
  }
  clientRequestCache.set(cacheKey, cacheEntry)

  return responsePromise
}

// Function to safely create a cache key from dependencies
function createDepsKey(deps: DependencyList): string {
  return deps.map(dep => {
    if (dep === null || dep === undefined) {
      return String(dep)
    }

    // Handle special cases that might contain circular references
    if (typeof dep === 'object') {
      // Handle URLSearchParams (used in analytics)
      if (dep instanceof URLSearchParams) {
        return `params:${dep.toString()}`
      }
      
      // Handle Supabase client
      if ('supabaseUrl' in dep) {
        return `supabase:${dep.supabaseUrl}`
      }

      // Handle Date objects
      if (dep instanceof Date) {
        return dep.toISOString()
      }

      // Handle arrays
      if (Array.isArray(dep)) {
        return `array:${dep.length}:${dep.join(',')}`
      }

      // Handle session token (used in analytics)
      if (typeof dep === 'object' && 'access_token' in dep) {
        return `token:${dep.access_token}`
      }

      try {
        // Try to create a stable string representation
        const keys = Object.keys(dep).sort()
        const values = keys.map(key => {
          const value = (dep as any)[key]
          return typeof value === 'function' ? 'fn' : String(value)
        })
        return `${dep.constructor.name}:${keys.join(',')}:${values.join(',')}`
      } catch {
        // Fallback for objects that can't be stringified
        return `${dep.constructor.name}:${Object.keys(dep).join(',')}`
      }
    }

    return String(dep)
  }).join('|')
}

// Hook for deduplicating effects in React components
export function useDedupingEffect(
  effect: () => (void | (() => void)),
  deps: DependencyList
) {
  const isFirstRun = useRef(new Set<string>())

  useEffect(() => {
    // Create a unique key for this effect instance
    const key = createDepsKey(deps)
    
    if (!isFirstRun.current.has(key)) {
      isFirstRun.current.add(key)
      return effect()
    }
  }, deps)
}

// Hook for deduplicating data fetching
export function useDedupingQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useDedupingEffect(() => {
    let isMounted = true
    setIsLoading(true)

    queryFn()
      .then((result) => {
        if (isMounted) {
          setData(result)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err)
          setData(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [key, ...deps])

  return { data, error, isLoading }
} 