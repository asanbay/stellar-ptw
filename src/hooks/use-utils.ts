import { useState, useCallback, useEffect, useRef } from 'react'

interface UseRetryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  onRetry?: (attempt: number) => void
  shouldRetry?: (error: Error) => boolean
}

interface RetryState {
  attempt: number
  isRetrying: boolean
  lastError: Error | null
}

/**
 * Хук для автоматического retry асинхронных операций
 */
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: UseRetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
    shouldRetry = () => true,
  } = options

  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const execute = useCallback(
    async (attempt = 0): Promise<T> => {
      try {
        setState((prev) => ({ ...prev, attempt, isRetrying: attempt > 0 }))
        const result = await asyncFn()
        setState({ attempt: 0, isRetrying: false, lastError: null })
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < maxRetries && shouldRetry(err)) {
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay

          onRetry?.(attempt + 1)

          return new Promise((resolve, reject) => {
            retryTimeoutRef.current = setTimeout(async () => {
              try {
                const result = await execute(attempt + 1)
                resolve(result)
              } catch (retryError) {
                reject(retryError)
              }
            }, delay)
          })
        }

        setState({ attempt, isRetrying: false, lastError: err })
        throw err
      }
    },
    [asyncFn, maxRetries, retryDelay, exponentialBackoff, onRetry, shouldRetry]
  )

  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    setState({ attempt: 0, isRetrying: false, lastError: null })
  }, [])

  return {
    execute,
    reset,
    ...state,
  }
}

/**
 * Хук для debounce значений
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Хук для throttle функций
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      const now = Date.now()
      if (now - lastRun.current >= delay) {
        lastRun.current = now
        return callback(...args)
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Хук для определения видимости элемента
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

/**
 * Хук для локального состояния с автосохранением
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(newValue))
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }
        return newValue
      })
    },
    [key]
  )

  return [state, setValue]
}

/**
 * Хук для копирования в буфер обмена
 */
export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), timeout)
        return true
      } catch {
        setIsCopied(false)
        return false
      }
    },
    [timeout]
  )

  return { isCopied, copy }
}

/**
 * Хук для отслеживания изменения размера окна
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * Хук для обнаружения кликов вне элемента
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [handler])

  return ref
}
