import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

/**
 * Global Error Handler Utility
 * Provides consistent API error surfacing with toast notifications
 * Handles auto-logout on 401/expired token
 */

/**
 * Get user-friendly error message from API error
 */
let lastToast = { message: null, ts: 0 }

const getErrorMessage = (error) => {
  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.'
    }
    // Axios/FETCH network error variants
    if (
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.message === 'Failed to fetch' ||
      error.name === 'TypeError'
    ) {
      const isOffline = typeof navigator !== 'undefined' && navigator && navigator.onLine === false
      return isOffline
        ? 'You are offline. Please reconnect to the internet.'
        : 'Network error. Please try again or reload the page.'
    }
    return 'An unexpected error occurred. Please try again.'
  }

  const { status, data } = error.response

  // Handle specific status codes
  switch (status) {
    case 400:
      return data?.message || 'Invalid request. Please check your input.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return data?.message || 'You do not have permission to perform this action.'
    case 404:
      return data?.message || 'The requested resource was not found.'
    case 409:
      return data?.message || 'A conflict occurred. Please try again.'
    case 422:
      return data?.message || 'Validation error. Please check your input.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.'
    case 503:
      return 'Service unavailable. Please try again later.'
    case 504:
      return 'Gateway timeout. Please try again later.'
    default:
      return data?.message || `An error occurred (${status}). Please try again.`
  }
}

/**
 * Handle API errors with toast notifications
 * @param {Error} error - The error object
 * @param {Object} options - Error handling options
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {boolean} options.autoLogout - Whether to auto-logout on 401 (default: true)
 * @param {string} options.customMessage - Custom error message to override default
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    autoLogout = true,
    customMessage = null,
  } = options

  const message = customMessage || getErrorMessage(error)
  const status = error.response?.status

  // Auto-logout on 401 (unauthorized/expired token)
  if (status === 401 && autoLogout) {
    const { logout } = useAuthStore.getState()
    
    // Show error toast
    if (showToast) {
      toast.error(message, {
        duration: 5000,
        icon: '🔒',
      })
    }

    // Clear auth and redirect to login
    logout()
    
    // Redirect to login if not already there
    const currentPath = window.location.pathname
    if (!['/login', '/register', '/oauth2/callback'].includes(currentPath)) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }

    return { handled: true, shouldRetry: false }
  }

  // Show toast notification for other errors
  if (showToast) {
    // de-duplicate the same toast within 5s
    const now = Date.now()
    if (lastToast.message === message && now - lastToast.ts < 5000) {
      return { handled: true, shouldRetry: status >= 500 }
    }
    lastToast = { message, ts: now }
    // Determine toast type based on status
    if (status >= 500) {
      toast.error(message, {
        duration: 5000,
        icon: '⚠️',
      })
    } else if (status === 403) {
      toast.error(message, {
        duration: 5000,
        icon: '🚫',
      })
    } else if (status === 429) {
      toast.error(message, {
        duration: 4000,
        icon: '⏱️',
      })
    } else {
      toast.error(message, {
        duration: 3500,
      })
    }
  }

  return { handled: true, shouldRetry: status >= 500 }
}

/**
 * Handle success messages with toast
 */
export const handleSuccess = (message, options = {}) => {
  const { duration = 3000, icon = '✅' } = options
  toast.success(message, { duration, icon })
}

/**
 * Handle info messages with toast
 */
export const handleInfo = (message, options = {}) => {
  const { duration = 3000 } = options
  toast(message, {
    duration,
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
  })
}

/**
 * Handle warning messages with toast
 */
export const handleWarning = (message, options = {}) => {
  const { duration = 4000 } = options
  toast(message, {
    duration,
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
  })
}

export default {
  handleApiError,
  handleSuccess,
  handleInfo,
  handleWarning,
  getErrorMessage,
}

