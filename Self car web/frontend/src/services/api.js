import axios from 'axios'
import { handleApiError } from '../utils/errorHandler'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Flag to prevent infinite retry loops
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Get auth token from localStorage (Zustand persist format)
 */
const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed?.state?.token || null
    }
  } catch (error) {
    console.error('Error reading auth token:', error)
  }
  return null
}

/**
 * Clear auth data and redirect to login
 */
const clearAuthAndRedirect = () => {
  localStorage.removeItem('auth-storage')
  // Only redirect if not already on login/register/oauth callback pages
  const currentPath = window.location.pathname
  if (!['/login', '/register', '/oauth2/callback'].includes(currentPath)) {
    window.location.href = '/login'
  }
}

/**
 * Request interceptor: Adds JWT/OAuth2 token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor: Handles 401 errors, token refresh, retries, and OAuth2 flows
 * Enhanced with better retry logic and exponential backoff
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Don't retry /auth/login, /auth/register, or /auth/me endpoints
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/me')) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      // Prevent infinite retry loops
      if (originalRequest._retry) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to validate token by calling /me endpoint
        const token = getAuthToken()
        if (token) {
          // Try to validate token by calling /me endpoint
          const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 5000, // 5 second timeout for validation
          })

          if (meResponse.status === 200) {
            // Token is still valid, retry original request
            processQueue(null, token)
            isRefreshing = false
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Token validation failed, clear auth and redirect
        processQueue(refreshError, null)
        isRefreshing = false
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      }

      // If we get here, token is invalid
      isRefreshing = false
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    // Handle network errors with retry logic (exponential backoff)
    if (!error.response && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 0
    }

    if (!error.response && originalRequest && originalRequest._retryCount < 2) {
      originalRequest._retryCount++
      const delay = Math.pow(2, originalRequest._retryCount) * 1000 // Exponential backoff
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return api(originalRequest)
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      // Emit custom event for RateLimitHandler
      const retryAfter = error.response.headers?.['retry-after']
      window.dispatchEvent(new CustomEvent('rate-limit', {
        detail: {
          status: 429,
          headers: error.response.headers,
          retryAfter,
        }
      }))
    }

    // Handle bot challenge (X-Bot-Challenge header)
    const botChallenge = error.response?.headers?.['x-bot-challenge']
    if (botChallenge) {
      // Emit custom event for BotChallengeHandler
      window.dispatchEvent(new CustomEvent('bot-challenge', {
        detail: {
          headers: error.response.headers,
          challengeType: botChallenge,
        }
      }))
    }

    // Handle other errors with toast notifications
    // Only show toast for non-401 errors (401 is handled above)
    if (error.response?.status !== 401) {
      handleApiError(error, { autoLogout: false })
    }

    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
}

// Car APIs
export const carAPI = {
  getAllCars: (params) => api.get('/cars', { params }),
  getCarById: (id) => api.get(`/cars/${id}`),
  createCar: (carData) => api.post('/cars', carData),
  updateCar: (id, carData) => api.put(`/cars/${id}`, carData),
  deleteCar: (id) => api.delete(`/cars/${id}`),
  getAvailableCars: (startDate, endDate) => 
    api.get('/cars/available', { params: { startDate, endDate } }),
  toggleAvailability: (id) => api.patch(`/cars/${id}/toggle-availability`),
  bulkToggleAvailability: (ids, available) => 
    api.patch('/cars/bulk/toggle-availability', { ids, available }),
}

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings/user'),
  getAllBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, status) => 
    api.patch(`/bookings/${id}/status`, { status }),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
}

// User APIs
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  getAllUsers: () => api.get('/users'),
}

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenueData: (period) => api.get('/dashboard/revenue', { params: { period } }),
  getRevenueByDealer: (from, to) => api.get('/dashboard/revenue/dealer', { params: { from, to } }),
  getRevenueByCategory: (from, to) => api.get('/dashboard/revenue/category', { params: { from, to } }),
  getRevenueByLocation: (from, to) => api.get('/dashboard/revenue/location', { params: { from, to } }),
  getBalanceOverview: () => api.get('/dashboard/balance-overview'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getSellerScore: () => api.get('/dashboard/seller-score'),
  getBusinessInsights: () => api.get('/dashboard/business-insights'),
  getBookingStatusBreakdown: (from, to) => api.get('/dashboard/bookings/status-breakdown', { params: { from, to } }),
}

// Chat/Message APIs
export const chatAPI = {
  sendMessage: (conversationId, content, shopId) => 
    api.post('/messages', { conversationId, content, shopId }),
  getUserConversations: () => api.get('/conversations'),
  getConversationMessages: (conversationId) => 
    api.get(`/conversations/${conversationId}/messages`),
  markMessageAsRead: (messageId) => 
    api.put(`/messages/${messageId}/read`),
  markAllMessagesAsRead: (conversationId) => 
    api.put(`/conversations/${conversationId}/read-all`),
}

/**
 * Create EventSource connection for real-time message updates
 * Note: EventSource doesn't support custom headers, so authentication
 * must be handled via cookies or query parameters.
 * The backend uses Spring Security which will authenticate via session cookies.
 * @param {number} conversationId - The conversation ID to subscribe to
 * @param {function} onMessage - Callback for new messages
 * @param {function} onConversationUpdate - Callback for conversation updates
 * @param {function} onError - Callback for errors
 * @returns {EventSource} The EventSource instance
 */
export const createMessageStream = (conversationId, onMessage, onConversationUpdate, onError) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  // EventSource will send cookies automatically for authentication
  // Spring Security will authenticate via session cookies
  const url = `${API_BASE_URL}/messages/stream/${conversationId}`
  
  const eventSource = new EventSource(url, {
    withCredentials: true,
  })

  // Handle new messages
  eventSource.addEventListener('new_message', (event) => {
    try {
      const message = JSON.parse(event.data)
      if (onMessage) onMessage(message)
    } catch (error) {
      console.error('Error parsing new_message event:', error)
      if (onError) onError(error)
    }
  })

  // Handle conversation updates
  eventSource.addEventListener('conversation_updated', (event) => {
    try {
      const conversation = JSON.parse(event.data)
      if (onConversationUpdate) onConversationUpdate(conversation)
    } catch (error) {
      console.error('Error parsing conversation_updated event:', error)
      if (onError) onError(error)
    }
  })

  // Handle connection established
  eventSource.addEventListener('connected', (event) => {
    console.log('Connected to message stream:', event.data)
  })

  // Handle errors
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error)
    if (onError) onError(error)
  }

  return eventSource
}


export default api
