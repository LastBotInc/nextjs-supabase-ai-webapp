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

// Use a more efficient server-side cache with LRU
const MAX_CACHE_SIZE = 1000 // Maximum number of cache entries
const serverRequestCache = new Map<string, CacheEntry>()
const cacheOrder: string[] = [] // LRU tracking
const CACHE_DURATION = 5000 // 5 seconds cache duration

// Function to create a cache key from request info
function createCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
  const url = input instanceof URL ? input.toString() : input.toString()
  const method = init?.method || 'GET'
  const body = init?.body ? JSON.stringify(init.body) : ''
  return `${method}:${url}:${body}`
}

// Clean expired cache entries and maintain LRU order
function cleanExpiredCache() {
  const now = Date.now()
  
  // Clean expired entries
  for (const key of [...serverRequestCache.keys()]) {
    const entry = serverRequestCache.get(key)
    if (entry && now - entry.timestamp > CACHE_DURATION) {
      serverRequestCache.delete(key)
      const index = cacheOrder.indexOf(key)
      if (index !== -1) {
        cacheOrder.splice(index, 1)
      }
    }
  }

  // Remove oldest entries if cache is too large
  while (serverRequestCache.size > MAX_CACHE_SIZE) {
    const oldestKey = cacheOrder.shift()
    if (oldestKey) {
      serverRequestCache.delete(oldestKey)
    }
  }
}

// Update cache order for LRU tracking
function updateCacheOrder(key: string) {
  const index = cacheOrder.indexOf(key)
  if (index !== -1) {
    cacheOrder.splice(index, 1)
  }
  cacheOrder.push(key)
}

// Create a response-like object
function createResponseObject(data: CacheEntry['data']) {
  if (!data) {
    throw new Error('No data available')
  }

  return {
    ok: data.ok,
    status: data.status,
    headers: data.headers,
    json: () => Promise.resolve(data.value),
    // Other methods throw errors as they're not needed
    text: () => Promise.reject(new Error('Only JSON is supported')),
    blob: () => Promise.reject(new Error('Only JSON is supported')),
    arrayBuffer: () => Promise.reject(new Error('Only JSON is supported')),
    formData: () => Promise.reject(new Error('Only JSON is supported')),
    clone: () => createResponseObject(data)
  }
}

// Deduplicating fetch wrapper for server-side
export async function dedupingServerFetch(input: RequestInfo | URL, init?: RequestInit) {
  const cacheKey = createCacheKey(input, init)
  const now = Date.now()
  
  // Clean expired entries
  cleanExpiredCache()

  // Check cache and return if valid
  const cachedEntry = serverRequestCache.get(cacheKey)
  if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION)) {
    updateCacheOrder(cacheKey) // Update LRU order
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
      
      // Create cache data with minimal header information
      const data = {
        value,
        status: response.status,
        ok: response.ok,
        headers: {
          'content-type': response.headers.get('content-type') || 'application/json',
          'cache-control': response.headers.get('cache-control') || ''
        }
      }
      
      // Update cache with the parsed data
      if (cacheEntry) {
        cacheEntry.data = data
      }

      return createResponseObject({ ...data })
    } catch (error) {
      // If JSON parsing fails, create error response
      const data = {
        value: { data: null, error: 'Failed to parse JSON response' },
        status: 500,
        ok: false,
        headers: {
          'content-type': 'application/json'
        }
      }
      return createResponseObject(data)
    }
  })()

  // Create and store the cache entry
  cacheEntry = {
    promise: responsePromise,
    timestamp: now
  }
  serverRequestCache.set(cacheKey, cacheEntry)
  updateCacheOrder(cacheKey) // Add to LRU order

  return responsePromise
} 