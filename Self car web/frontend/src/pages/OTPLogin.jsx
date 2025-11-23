import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Input } from '../components/Foundation'
import OTPInput from '../components/Auth/OTPInput'
import { otpSchema, loginSchema } from '../utils/validation'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

/**
 * OTP Login Page (FE-071)
 * 
 * Passwordless login with OTP:
 * - Email/phone input
 * - OTP code entry
 * - Rate limiting feedback
 * - Throttle UX
 */
const OTPLogin = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [otpError, setOtpError] = useState('')
  const { login } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema.pick({ email: true })),
  })

  // Rate limit countdown
  useEffect(() => {
    if (rateLimitSeconds > 0) {
      const timer = setInterval(() => {
        setRateLimitSeconds((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [rateLimitSeconds])

  // Handle email submission
  const onSubmitEmail = async (data) => {
    setIsSendingOTP(true)
    setEmail(data.email)

    try {
      // Send OTP request
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60')
          setRateLimitSeconds(retryAfter)
          toast.error(`Too many requests. Please wait ${retryAfter} seconds.`)
          return
        }

        throw new Error(errorData.message || 'Failed to send OTP')
      }

      toast.success('OTP code sent to your email!')
      setStep('otp')
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsSendingOTP(false)
    }
  }

  // Handle OTP verification
  const handleOTPComplete = async (otpCode) => {
    setIsVerifyingOTP(true)
    setOtpError('')

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otpCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60')
          setRateLimitSeconds(retryAfter)
          toast.error(`Too many attempts. Please wait ${retryAfter} seconds.`)
          return
        }

        setOtpError(errorData.message || 'Invalid OTP code')
        return
      }

      const data = await response.json()
      
      // Login user
      if (data.token) {
        login(data.token, data.user)
        toast.success('Login successful!')
        navigate(searchParams.get('redirect') || '/')
      }
    } catch (error) {
      setOtpError(error.message || 'Failed to verify OTP. Please try again.')
    } finally {
      setIsVerifyingOTP(false)
    }
  }

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (rateLimitSeconds > 0) return

    setIsSendingOTP(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60')
          setRateLimitSeconds(retryAfter)
        }
        throw new Error('Failed to resend OTP')
      }

      toast.success('OTP code resent!')
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP')
    } finally {
      setIsSendingOTP(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Passwordless Login' : 'Enter OTP Code'}
          </h2>
          <p className="text-gray-600 text-lg">
            {step === 'email' 
              ? 'We will send you a verification code'
              : `Code sent to ${email}`
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="card bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30">
          {step === 'email' ? (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-6">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSendingOTP}
                className="w-full"
              >
                Send OTP Code
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Use password instead
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <OTPInput
                length={6}
                onComplete={handleOTPComplete}
                onResend={handleResendOTP}
                isLoading={isVerifyingOTP}
                isResending={isSendingOTP}
                rateLimitSeconds={rateLimitSeconds}
                error={otpError}
              />

              <div className="flex flex-col gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<ArrowLeft size={18} />}
                  onClick={() => {
                    setStep('email')
                    setOtpError('')
                  }}
                  className="w-full"
                >
                  Back to Email
                </Button>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Use password instead
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default OTPLogin

