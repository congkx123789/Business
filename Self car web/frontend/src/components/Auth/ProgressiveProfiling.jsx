import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import PreferencesForm from '../Profile/PreferencesForm'
import useAuthStore from '../../store/authStore'
import { usePreferencesStore } from '../../store/preferencesStore'
import toast from 'react-hot-toast'

/**
 * ProgressiveProfiling Component (FE-072)
 * 
 * Shows preferences form after first login:
 * - Locale selection
 * - Theme preference
 * - Progressive profiling (interests, etc.)
 */
const ProgressiveProfiling = ({ onComplete }) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const preferences = usePreferencesStore()
  const [isVisible, setIsVisible] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  useEffect(() => {
    // Always show on mount if this component is rendered
    // Parent component controls when to show it
    setIsVisible(true)
  }, [])

  const handleSkip = () => {
    setIsSkipping(true)
    localStorage.setItem('user_preferences_completed', 'true')
    toast.success('You can update preferences anytime in Settings')
    setTimeout(() => {
      setIsVisible(false)
      if (onComplete) onComplete()
    }, 300)
  }

  const handleComplete = () => {
    localStorage.setItem('user_preferences_completed', 'true')
    toast.success('Preferences saved! Welcome to SelfCar!')
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-default px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      Welcome, {user?.firstName || 'there'}! 👋
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      Let's personalize your experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                  aria-label="Skip"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-dark-text-secondary">
                    Help us customize your experience by setting your preferences. 
                    You can always change these later in Settings.
                  </p>
                </div>
                
                <PreferencesForm 
                  onComplete={handleComplete}
                  showTitle={false}
                />

                {/* Skip Button */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="text-sm text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProgressiveProfiling

