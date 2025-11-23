import { useState, useRef, useEffect } from 'react'
import { Input } from '../Foundation'
import { Loader2 } from 'lucide-react'

/**
 * OTPInput Component (FE-071)
 * 
 * OTP input with:
 * - Rate-limit feedback
 * - Throttle UX
 * - Passwordless option
 * - Auto-focus and paste support
 */
const OTPInput = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  isResending = false,
  rateLimitSeconds = 0,
  error,
  ...props
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '')
    if (digit.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if OTP is complete
    if (newOtp.every((val) => val !== '')) {
      const otpString = newOtp.join('')
      if (onComplete) {
        onComplete(otpString)
      }
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData.length === length) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      
      // Auto-submit if complete
      if (onComplete) {
        onComplete(pastedData)
      }
    }
  }

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4" {...props}>
      {/* OTP Inputs */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all ${
              error
                ? 'border-error focus:border-error'
                : 'border-gray-300 dark:border-dark-border-default focus:border-primary-500 dark:focus:border-primary-400'
            } bg-white dark:bg-dark-bg-secondary focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-error text-center" role="alert">
          {error}
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
          <Loader2 size={16} className="animate-spin" />
          <span>Verifying code...</span>
        </div>
      )}

      {/* Resend Button */}
      <div className="text-center">
        {rateLimitSeconds > 0 ? (
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Resend code in {formatTime(rateLimitSeconds)}
          </p>
        ) : (
          <button
            onClick={onResend}
            disabled={isResending}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Sending...
              </span>
            ) : (
              'Resend Code'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default OTPInput

