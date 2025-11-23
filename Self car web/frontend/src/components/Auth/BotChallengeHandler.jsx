import { useEffect, useState } from 'react'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

/**
 * BotChallengeHandler - Handles bot protection challenges
 * Shows human-friendly UI when X-Bot-Challenge header is received
 */
const BotChallengeHandler = () => {
  const [challenge, setChallenge] = useState(null)
  const [challengeType, setChallengeType] = useState(null) // 'captcha', 'hcaptcha', 'challenge'

  useEffect(() => {
    const handleBotChallenge = (event) => {
      const challengeHeader = event.detail?.headers?.['x-bot-challenge']
      
      if (challengeHeader) {
        setChallengeType(challengeHeader)
        setChallenge(true)

        // Show friendly message
        toast('Please complete the security check to continue.', {
          duration: 5000,
          icon: '🛡️',
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        })
      }
    }

    // Listen for bot challenge events
    window.addEventListener('bot-challenge', handleBotChallenge)

    return () => {
      window.removeEventListener('bot-challenge', handleBotChallenge)
    }
  }, [])

  const handleChallengeComplete = () => {
    setChallenge(false)
    setChallengeType(null)
    toast.success('Security check completed!', {
      duration: 3000,
      icon: '✅',
    })
  }

  if (!challenge) return null

  return (
    <AnimatePresence>
      {challenge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-md w-full bg-white dark:bg-dark-bg-secondary"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                <Shield className="text-primary-600 dark:text-primary-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                Security Check Required
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                We need to verify you're human to protect against automated requests.
              </p>
            </div>

            <div className="space-y-4">
              {/* Challenge widget placeholder */}
              <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-dark-border-default">
                <div className="text-center">
                  <AlertTriangle className="mx-auto text-gray-400 dark:text-dark-text-tertiary mb-2" size={24} />
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {challengeType === 'captcha' && 'Complete the CAPTCHA below'}
                    {challengeType === 'hcaptcha' && 'Complete the hCaptcha below'}
                    {!['captcha', 'hcaptcha'].includes(challengeType) && 'Complete the security challenge below'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                    Challenge type: {challengeType || 'unknown'}
                  </p>
                </div>
              </div>

              {/* Demo: In production, integrate actual challenge widget here */}
              <div className="flex items-center justify-center">
                <button
                  onClick={handleChallengeComplete}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  <span>Complete Challenge (Demo)</span>
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                This is a demo. In production, integrate with your bot protection service (e.g., reCAPTCHA, hCaptcha).
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BotChallengeHandler

