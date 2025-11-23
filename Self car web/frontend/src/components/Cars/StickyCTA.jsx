import { useState, useEffect } from 'react'
import { MessageCircle, Calendar, CreditCard, Calculator, Phone, Mail } from 'lucide-react'
import { Button } from '../Foundation'
import { trackPDPLatency, trackPDPEvent } from '../../utils/metrics'
import toast from 'react-hot-toast'
import { getExperimentValue, AB_EXPERIMENTS, trackExperimentView, trackExperimentConversion } from '../../utils/abTesting'
import { useTranslation } from 'react-i18next'

/**
 * StickyCTA Component (FE-061)
 * 
 * Sticky summary bar with primary CTA:
 * - Contact/chat
 * - Test-drive booking
 * - Finance estimate
 * - Analytics events tracking
 */
const StickyCTA = ({ car, isAuthenticated, onMessageSeller, onBookTestDrive, onFinanceEstimate }) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // AB Test: PDP CTA layout
  const ctaLayout = getExperimentValue(AB_EXPERIMENTS.PDP_CTA_LAYOUT)
  
  useEffect(() => {
    trackExperimentView(AB_EXPERIMENTS.PDP_CTA_LAYOUT, ctaLayout)
  }, [ctaLayout])

  // Show sticky CTA after scrolling past header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 200)
      setScrolled(scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track CTA visibility
  useEffect(() => {
    if (isVisible && car) {
      trackPDPEvent('sticky_cta_viewed', { carId: car.id, carName: car.name })
    }
  }, [isVisible, car])

  const handleContact = () => {
    trackPDPEvent('cta_contact_clicked', { carId: car?.id, carName: car?.name })
    if (onMessageSeller) {
      onMessageSeller()
    }
  }

  const handleTestDrive = () => {
    trackPDPEvent('cta_test_drive_clicked', { carId: car?.id, carName: car?.name })
    if (onBookTestDrive) {
      onBookTestDrive()
    } else {
      toast.success('Test drive booking feature coming soon!')
    }
  }

  const handleFinance = () => {
    trackPDPEvent('cta_finance_clicked', { carId: car?.id, carName: car?.name })
    if (onFinanceEstimate) {
      onFinanceEstimate()
    } else {
      toast.success('Finance calculator feature coming soon!')
    }
  }

  const handleBook = () => {
    trackPDPEvent('cta_book_clicked', { carId: car?.id, carName: car?.name })
    trackExperimentConversion(AB_EXPERIMENTS.PDP_CTA_LAYOUT, ctaLayout, 'book_clicked')
    window.location.href = `/booking/${car?.id}`
  }

  const handleContactWithTracking = () => {
    trackExperimentConversion(AB_EXPERIMENTS.PDP_CTA_LAYOUT, ctaLayout, 'contact_clicked')
    handleContact()
  }

  if (!isVisible || !car) return null

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-xl border-t border-gray-200 dark:border-dark-border-default shadow-2xl transition-all duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              {car.imageUrl && (
                <img
                  src={car.imageUrl}
                  alt={car.name}
                  className="rounded-lg object-cover flex-shrink-0"
                  style={{ width: '12%', height: 'auto' }}
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary truncate">
                  {car.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  {car.brand} • {car.year}
                </p>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(car.pricePerDay)}/day
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - AB Tested Layout */}
          {ctaLayout === 'horizontal' && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle size={18} />}
                onClick={handleContactWithTracking}
                className="flex-shrink-0"
              >
                {t('common:cta.contact') || 'Contact'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calendar size={18} />}
                onClick={handleTestDrive}
                className="flex-shrink-0"
              >
                {t('common:cta.testDrive') || 'Test Drive'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calculator size={18} />}
                onClick={handleFinance}
                className="flex-shrink-0"
              >
                {t('common:cta.finance') || 'Finance'}
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<CreditCard size={18} />}
                onClick={handleBook}
                disabled={!car.available}
                className="flex-shrink-0"
              >
                {car.available ? (t('common:cta.bookNow') || 'Book Now') : (t('common:cta.unavailable') || 'Unavailable')}
              </Button>
            </div>
          )}
          
          {ctaLayout === 'vertical' && (
            <div className="flex flex-col gap-2 min-w-[8.75rem]">
              <Button
                variant="primary"
                size="md"
                leftIcon={<CreditCard size={18} />}
                onClick={handleBook}
                disabled={!car.available}
                className="w-full"
              >
                {car.available ? 'Book Now' : 'Unavailable'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle size={18} />}
                onClick={handleContactWithTracking}
                className="w-full"
              >
                {t('common:cta.contact') || 'Contact'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calendar size={18} />}
                onClick={handleTestDrive}
                className="w-full"
              >
                {t('common:cta.testDrive') || 'Test Drive'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calculator size={18} />}
                onClick={handleFinance}
                className="w-full"
              >
                {t('common:cta.finance') || 'Finance'}
              </Button>
            </div>
          )}
          
          {ctaLayout === 'split' && (
            <div className="flex flex-col gap-2 min-w-[8.75rem]">
              <Button
                variant="primary"
                size="md"
                leftIcon={<CreditCard size={18} />}
                onClick={handleBook}
                disabled={!car.available}
                className="w-full"
              >
                {car.available ? (t('common:cta.bookNow') || 'Book Now') : (t('common:cta.unavailable') || 'Unavailable')}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<MessageCircle size={18} />}
                  onClick={handleContactWithTracking}
                  className="flex-1"
                >
                  {t('common:cta.contact') || 'Contact'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Calendar size={18} />}
                  onClick={handleTestDrive}
                  className="flex-1"
                >
                  {t('common:cta.testDrive') || 'Test Drive'}
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calculator size={18} />}
                onClick={handleFinance}
                className="w-full"
              >
                {t('common:cta.finance') || 'Finance'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StickyCTA

