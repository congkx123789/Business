import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Download, Mail, Calendar, MapPin, CreditCard, Clock } from 'lucide-react'
import { Button } from '../components/Foundation'
import { motion } from 'framer-motion'
import { formatDate, formatCurrency } from '../utils/localeFormatting'

/**
 * CheckoutSuccess Page (FE-081)
 * 
 * Enhanced checkout success page with:
 * - Receipt display
 * - Timer for auto-redirect
 * - Download/print options
 * - Email confirmation
 */
const CheckoutSuccess = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['checkout', 'common'])
  const [countdown, setCountdown] = useState(10)
  const [autoRedirect, setAutoRedirect] = useState(true)

  // Mock booking data - in production, fetch from API
  const booking = {
    id: bookingId || '12345',
    carName: 'Toyota Camry 2023',
    carImage: '/images/car-placeholder.jpg',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalPrice: 350.00,
    paymentMethod: 'Visa •••• 4242',
    confirmationNumber: 'CONF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    pickupLocation: '123 Main St, New York, NY 10001',
    dropoffLocation: 'Same as pickup',
  }

  // Countdown timer
  useEffect(() => {
    if (!autoRedirect) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/profile')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoRedirect, navigate])

  const handleDownload = () => {
    // Generate and download PDF receipt
    window.print()
  }

  const handleEmailReceipt = () => {
    // Send receipt via email
    alert('Receipt will be sent to your email address')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle size={48} className="text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
            {t('checkout:bookingConfirmed', 'Booking Confirmed!')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-2">
            {t('checkout:bookingConfirmedMessage', 'Your booking has been successfully confirmed.')}
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
            {t('checkout:confirmationNumber', 'Confirmation Number')}: <span className="font-semibold">{booking.confirmationNumber}</span>
          </p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-xl border border-gray-200 dark:border-dark-border-default p-6 mb-6"
        >
          <div className="flex items-start gap-4 mb-6">
            {booking.carImage && (
              <img
                src={booking.carImage}
                alt={booking.carName}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                {booking.carName}
              </h2>
              <div className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    {formatDate(booking.startDate, { year: 'numeric', month: 'short', day: 'numeric' })} - {formatDate(booking.endDate, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{booking.pickupLocation}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-dark-border-default pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-dark-text-secondary">{t('checkout:subtotal', 'Subtotal')}</span>
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                {formatCurrency(booking.totalPrice * 0.9)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-dark-text-secondary">{t('checkout:taxAndFees', 'Tax & Fees')}</span>
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                {formatCurrency(booking.totalPrice * 0.1)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-dark-border-default">
              <span className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">{t('checkout:total', 'Total')}</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-tertiary pt-2">
              <CreditCard size={16} />
              <span>{t('checkout:paidWith', 'Paid with')} {booking.paymentMethod}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download size={18} />}
            onClick={handleDownload}
            className="flex-1"
          >
            {t('checkout:downloadReceipt', 'Download Receipt')}
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Mail size={18} />}
            onClick={handleEmailReceipt}
            className="flex-1"
          >
            {t('checkout:emailReceipt', 'Email Receipt')}
          </Button>
          <Button
            variant="secondary"
            size="md"
            as={Link}
            to="/profile"
            className="flex-1"
          >
            {t('checkout:viewBookings', 'View Bookings')}
          </Button>
        </motion.div>

        {/* Auto-redirect Notice */}
        {autoRedirect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={16} className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('checkout:redirectingIn', 'Redirecting to your bookings in {{count}} seconds...', { count: countdown })}
              </p>
            </div>
            <button
              onClick={() => setAutoRedirect(false)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {t('checkout:cancelAutoRedirect', 'Cancel auto-redirect')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CheckoutSuccess

