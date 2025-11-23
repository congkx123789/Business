import { useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { handleApiError, handleSuccess } from '../utils/errorHandler'
import { Loader } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * OAuth2 Callback Page
 * Handles OAuth2 provider callbacks and authenticates users
 * Treats OAuth2 sign-in exactly like classic login (same store, same token plumbing)
 */
const OAuth2Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  /**
   * Fetch user details from /me endpoint using token
   * This treats OAuth2 authentication exactly like classic login
   * Uses the same authAPI service and authStore as classic login
   * OAuth2 users have oauthProvider and oauthProviderId fields, but are treated identically
   */
  const fetchUserDetails = useCallback(async (token) => {
    try {
      // Set token via the same storage mechanism used by classic login
      const tempStorage = localStorage.getItem('auth-storage')
      const tempAuth = tempStorage ? JSON.parse(tempStorage) : { state: {} }
      tempAuth.state.token = token
      localStorage.setItem('auth-storage', JSON.stringify(tempAuth))
      
      // Use fetchCurrentUser from authStore to ensure consistent flow
      // This fetches complete user data from /me endpoint
      // OAuth2 users will have oauthProvider and oauthProviderId populated
      const { fetchCurrentUser } = useAuthStore.getState()
      const userData = await fetchCurrentUser()
      
      if (!userData) {
        throw new Error('Failed to fetch user data')
      }
      
      handleSuccess('Login successful!')
      
      // Redirect based on role (same logic as classic login)
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      console.error('OAuth2 callback error:', error)
      handleApiError(error, { autoLogout: false })
      navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    // Handle postMessage from OAuth2SuccessHandler (secure token delivery)
    const handlePostMessage = (event) => {
      // Verify origin matches backend (for security)
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const allowedOrigin = new URL(backendUrl).origin
      
      // In development, allow localhost variations
      const isLocalhost = event.origin.includes('localhost') || event.origin.includes('127.0.0.1')
      const isAllowedOrigin = event.origin === allowedOrigin || (isLocalhost && allowedOrigin.includes('localhost'))
      
      if (!isAllowedOrigin) {
        console.warn('OAuth2 callback: Ignoring message from unauthorized origin:', event.origin)
        return
      }

      if (event.data && event.data.type === 'OAUTH2_SUCCESS' && event.data.token) {
        // Token received via postMessage (secure method)
        fetchUserDetails(event.data.token)
      }
    }

    // Listen for postMessage from OAuth2 popup
    window.addEventListener('message', handlePostMessage)

    // Check for error/success flags only; do not accept tokens via URL
    const error = searchParams.get('error')
    const success = searchParams.get('success')
    
    if (error) {
      // Handle OAuth2 error from provider
      handleApiError(
        new Error(error || 'OAuth2 authentication failed'),
        { autoLogout: false }
      )
      navigate('/login', { replace: true })
      return
    }
    
    // If success flag is set, wait for secure postMessage delivery
    if (success === 'true') {
      // Wait for postMessage (handler above will process it)
      return
    }
    
    if (!success) {
      // No token and no success flag - might be a direct visit or failed OAuth
      handleApiError(
        new Error('Authentication failed. No token received.'),
        { autoLogout: false }
      )
      navigate('/login', { replace: true })
    }

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [searchParams, navigate, fetchUserDetails])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-lg">
            <Loader className="text-white" size={32} />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we authenticate you...</p>
      </motion.div>
    </div>
  )
}

export default OAuth2Callback
