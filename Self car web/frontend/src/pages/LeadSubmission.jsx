import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Clock, Send, MessageCircle, Phone, Mail, User, AlertCircle } from 'lucide-react'
import { Button } from '../components/Foundation'
import FormField from '../components/Forms/FormField'
import { contactSchema } from '../utils/validation'
import { useCar } from '../hooks/useCars'
import toast from 'react-hot-toast'
import { trackUserAction } from '../utils/metrics'

/**
 * Lead Submission Page (FE-081)
 * 
 * Lead submission form with:
 * - Timer for urgency
 * - Inline validation
 * - Form state management
 * - Success/error states
 */
const LeadSubmission = () => {
  const { carId } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const { data: car } = useCar(carId)

  const methods = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      carId: carId || '',
      preferredContactMethod: 'email',
    },
    mode: 'onChange', // Real-time validation
  })

  // Timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    trackUserAction('lead_submission_started', { carId })

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          carId: carId || data.carId,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit lead')
      }

      trackUserAction('lead_submission_success', { carId, timeElapsed })
      setSubmitted(true)
      toast.success('Your inquiry has been submitted! We\'ll contact you soon.')
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(`/cars/${carId}`)
      }, 3000)
    } catch (error) {
      trackUserAction('lead_submission_error', { carId, error: error.message })
      toast.error('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full card text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h2>
          <p className="text-gray-600 mb-4">
            We've received your inquiry and will contact you soon.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(`/cars/${carId}`)}
            className="w-full"
          >
            Return to Car Details
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Contact Seller
            </h1>
            {timeElapsed > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Clock size={16} />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            )}
          </div>
          {car && (
            <p className="text-lg text-gray-600">
              Inquire about <span className="font-semibold">{car.name}</span>
            </p>
          )}
        </motion.div>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="card space-y-6">
            {/* Name */}
            <FormField
              name="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              required
              helperText="Enter your full name as you'd like to be addressed"
              validationMode="onChange"
            />

            {/* Email */}
            <FormField
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
              helperText="We'll use this to send you updates"
              validationMode="onChange"
            />

            {/* Phone */}
            <FormField
              name="phone"
              label="Phone Number"
              type="tel"
              mask="phone"
              placeholder="(555) 123-4567"
              helperText="Optional - for faster communication"
              validationMode="onBlur"
            />

            {/* Preferred Contact Method */}
            <FormField
              name="preferredContactMethod"
              label="Preferred Contact Method"
              as="select"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'both', label: 'Both' },
              ]}
              helperText="How would you like us to contact you?"
            />

            {/* Message */}
            <FormField
              name="message"
              label="Message"
              type="textarea"
              placeholder="Tell us about your interest in this car..."
              required
              helperText="Minimum 10 characters. Include any questions or special requests."
              validationMode="onChange"
              rows={5}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Send size={20} />}
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
            </Button>
          </form>
        </FormProvider>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Your information is secure</p>
              <p>We'll only use your contact information to respond to your inquiry. We never share your data with third parties.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LeadSubmission

