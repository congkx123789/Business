import { useEffect, useState } from 'react'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

/**
 * RateLimitHandler - Handles rate limiting UI and user feedback
 * Shows friendly messages when rate limits are hit
 */
const RateLimitHandler = () => {
  const [rateLimited, setRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(null)

  // Listen for rate limit errors from API responses
  useEffect(() => {
    const handleRateLimit = (event) => {
      if (event.detail?.status === 429) {
        const retryAfterHeader = event.detail.headers?.['retry-after']
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60
        
        setRetryAfter(retryAfterSeconds)
        setRateLimited(true)

        // Show toast with retry info
        toast.error(
          `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
          {
            duration: retryAfterSeconds * 1000,
            icon: '⏱️',
          }
        )

        // Auto-dismiss after retry period
        const timer = setTimeout(() => {
          setRateLimited(false)
          setRetryAfter(null)
        }, retryAfterSeconds * 1000)

        return () => clearTimeout(timer)
      }
    }

    // Listen for custom rate limit events
    window.addEventListener('rate-limit', handleRateLimit)

    return () => {
      window.removeEventListener('rate-limit', handleRateLimit)
    }
  }, [])

  if (!rateLimited) return null

  return (
    <AnimatePresence>
      {rateLimited && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Clock className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Rate Limit Exceeded
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-2">
                  You've made too many requests. Please wait a moment before trying again.
                </p>
                {retryAfter && (
                  <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Retry after {retryAfter} seconds</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setRateLimited(false)
                  setRetryAfter(null)
                }}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                aria-label="Dismiss rate limit notice"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RateLimitHandler

