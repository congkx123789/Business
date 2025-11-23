import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import { useCurrentUser } from '../../hooks/useAuth'
import { handleApiError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

/**
 * SessionResume - Handles session resume and expiry states
 * Shows graceful UX when session is about to expire or has expired
 */
const SessionResume = () => {
  const navigate = useNavigate()
  const { token, isAuthenticated, fetchCurrentUser } = useAuthStore()
  const { data: user, isLoading, error, refetch } = useCurrentUser()
  const [sessionExpiring, setSessionExpiring] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [isResuming, setIsResuming] = useState(false)

  // Check session status on mount and periodically
  useEffect(() => {
    if (!isAuthenticated || !token) return

    const checkSession = async () => {
      try {
        const userData = await fetchCurrentUser()
        if (!userData) {
          setSessionExpired(true)
        } else {
          // Session is valid, clear any expiring state
          setSessionExpiring(false)
          setSessionExpired(false)
        }
      } catch (err) {
        // Check if it's a 401 (expired) or network error
        if (err.response?.status === 401) {
          setSessionExpired(true)
        }
      }
    }

    // Check immediately
    checkSession()

    // Check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, token, fetchCurrentUser])

  // Handle session expiry
  useEffect(() => {
    if (sessionExpired && isAuthenticated) {
      toast.error('Your session has expired. Please sign in again.', {
        duration: 5000,
        icon: '🔒',
      })
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: window.location.pathname,
            reason: 'session_expired'
          }
        })
      }, 2000)
    }
  }, [sessionExpired, isAuthenticated, navigate])

  const handleResumeSession = async () => {
    setIsResuming(true)
    try {
      const userData = await refetch()
      if (userData?.data) {
        setSessionExpiring(false)
        toast.success('Session resumed successfully!')
      }
    } catch (err) {
      handleApiError(err, { autoLogout: false })
      setSessionExpired(true)
    } finally {
      setIsResuming(false)
    }
  }

  // Don't render if no session issues
  if (!sessionExpiring && !sessionExpired) return null

  return (
    <AnimatePresence>
      {(sessionExpiring || sessionExpired) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className={`card ${
            sessionExpired 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-start gap-3">
              {sessionExpired ? (
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <Clock className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  sessionExpired 
                    ? 'text-red-900 dark:text-red-100' 
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}>
                  {sessionExpired ? 'Session Expired' : 'Session Expiring Soon'}
                </h3>
                <p className={`text-sm ${
                  sessionExpired 
                    ? 'text-red-700 dark:text-red-200' 
                    : 'text-yellow-700 dark:text-yellow-200'
                }`}>
                  {sessionExpired 
                    ? 'Your session has expired. You will be redirected to sign in.'
                    : 'Your session is about to expire. Click below to extend it.'}
                </p>
                {!sessionExpired && (
                  <button
                    onClick={handleResumeSession}
                    disabled={isResuming}
                    className="mt-3 btn-primary text-sm py-2 px-4 flex items-center gap-2"
                  >
                    {isResuming ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>Resuming...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        <span>Resume Session</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SessionResume

