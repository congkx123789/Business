import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressiveProfiling from '../components/Auth/ProgressiveProfiling'
import { useState } from 'react'

const Login = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showProgressiveProfiling, setShowProgressiveProfiling] = useState(false)

  const onSubmit = async (data) => {
    try {
      await loginMutation.mutateAsync(data)
      toast.success('Welcome back!')
      
      // Check if user needs progressive profiling
      const isFirstLogin = !localStorage.getItem('user_preferences_completed')
      if (isFirstLogin && loginMutation.data?.user?.role !== 'ADMIN') {
        setShowProgressiveProfiling(true)
        return
      }
      
      // Redirect based on role
      if (loginMutation.data?.user?.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (error) {
      // Handle rate limiting with friendly message
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers?.['retry-after'] || 60
        toast.error(
          `Too many login attempts. Please wait ${retryAfter} seconds before trying again.`,
          { duration: 6000, icon: '⏱️' }
        )
        return
      }

      // Handle OTP/throttling messages
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
      
      // Check for OTP-related messages
      if (errorMessage.toLowerCase().includes('otp') || errorMessage.toLowerCase().includes('code')) {
        toast.error(errorMessage, { duration: 6000, icon: '📧' })
      } else if (errorMessage.toLowerCase().includes('throttle') || errorMessage.toLowerCase().includes('rate')) {
        toast.error(errorMessage, { duration: 6000, icon: '⏱️' })
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="text-white" size={32} />
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-lg">Sign in to your account to continue</p>
        </div>

        {/* Form Card - Enhanced with glassmorphism */}
        <div className="card bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                <input
                  id="email"
                  type="email"
                  className="input-field pl-10 relative z-0"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-sm mt-1 flex items-center gap-1"
                  role="alert"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                <input
                  id="password"
                  type="password"
                  className="input-field pl-10 relative z-0"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-sm mt-1 flex items-center gap-1"
                  role="alert"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[3rem] text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* OAuth2 Buttons */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            <a
              href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080'}/oauth2/authorization/google`}
              className="w-full inline-flex justify-center items-center px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            <a
              href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080'}/oauth2/authorization/github`}
              className="w-full inline-flex justify-center items-center px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
              </svg>
              Continue with GitHub
            </a>

            <a
              href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080'}/oauth2/authorization/facebook`}
              className="w-full inline-flex justify-center items-center px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </a>
          </div>

          {/* Passwordless Login Link */}
          <div className="mt-4 text-center">
            <Link 
              to="/otp-login" 
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Use passwordless login
            </Link>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progressive Profiling Modal */}
      {showProgressiveProfiling && (
        <ProgressiveProfiling
          onComplete={() => {
            setShowProgressiveProfiling(false)
            navigate('/')
          }}
        />
      )}
    </div>
  )
}

export default Login
