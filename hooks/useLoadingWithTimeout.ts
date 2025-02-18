import { useState, useEffect, useCallback, useRef } from 'react'

interface UseLoadingWithTimeoutOptions {
  timeout?: number
  onTimeout?: () => void
}

export function useLoadingWithTimeout(options: UseLoadingWithTimeoutOptions = {}) {
  const { timeout = 10000, onTimeout } = options
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const startLoading = useCallback((): void => {
    setLoading(true)
    timeoutRef.current = setTimeout(() => {
      setLoading(false)
      onTimeout?.()
    }, timeout)
  }, [timeout, onTimeout])

  const stopLoading = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    loading,
    startLoading,
    stopLoading
  }
} 