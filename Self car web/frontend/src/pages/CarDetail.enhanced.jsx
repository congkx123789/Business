import { useParams, useNavigate } from 'react-router-dom'
import { useCar } from '../hooks/useCars'
import { useSimilarCars } from '../hooks/useSimilarCars'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useMessageStore from '../store/messageStore'
import toast from 'react-hot-toast'
import { Spinner } from '../components/Shared/LoadingSkeleton'
import { ErrorState } from '../components/Shared/ErrorState'
import { Button } from '../components/Foundation'
import ImageGallery from '../components/Cars/ImageGallery'
import StickyCTA from '../components/Cars/StickyCTA'
import SpecsAccordion from '../components/Cars/SpecsAccordion'
import SellerCard from '../components/Cars/SellerCard'
import CarCard from '../components/Cars/CarCard'
import { useEffect, useRef } from 'react'

/**
 * CarDetail Page - Enhanced (FE-060, FE-061, FE-062)
 * 
 * Product Detail Page with:
 * - Media gallery with lightbox
 * - Sticky CTA with analytics
 * - Specs accordion
 * - Seller card
 * - Similar items rail
 */
const CarDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { conversations, createConversation, setActiveConversation } = useMessageStore()

  const { data: car, isLoading, error, refetch } = useCar(id)
  const { data: similarCars } = useSimilarCars(id)
  const loadTimeRef = useRef(Date.now())

  // Preload images
  useEffect(() => {
    if (car?.imageUrl) {
      const images = [car.imageUrl, ...(car.images || [])]
      images.forEach((url) => {
        const img = new Image()
        img.src = url
      })
    }
  }, [car])

  const handleMessageSeller = () => {
    if (!isAuthenticated) {
      toast.error('Please login to message the seller')
      navigate('/login')
      return
    }

    const adminUser = {
      id: 2,
      name: 'Admin User',
      email: 'admin@selfcar.com',
      role: 'ADMIN'
    }

    const existingConv = conversations.find(conv => {
      const hasAdmin = conv.participants.some(p => p.role === 'ADMIN')
      const hasCurrentUser = conv.participants.some(p => p.id === user.id)
      return hasAdmin && hasCurrentUser
    })

    if (existingConv) {
      setActiveConversation(existingConv.id)
      navigate('/messages')
      toast.success('Opening conversation with seller')
    } else {
      const newConvId = createConversation([
        { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role },
        adminUser
      ])
      navigate('/messages')
      toast.success('Conversation started with seller')
    }
  }

  const handleBookTestDrive = () => {
    toast.success('Test drive booking feature coming soon!')
  }

  const handleFinanceEstimate = () => {
    toast.success('Finance calculator feature coming soon!')
  }

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size={64} />
      </div>
    )
  }

  if (error || !car) {
    return (
      <ErrorState
        title="Car not found"
        message={error?.response?.data?.message || error?.message || 'The car you\'re looking for doesn\'t exist.'}
        onRetry={refetch}
        showHomeButton
      />
    )
  }

  // Prepare images for gallery
  const images = car.images && car.images.length > 0 
    ? [car.imageUrl, ...car.images].filter(Boolean)
    : car.imageUrl ? [car.imageUrl] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cars')}
          className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Cars</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery
              images={images}
              primaryImageIndex={0}
              carName={car.name}
            />

            {/* Title & Price */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
                {car.name}
              </h1>
              <p className="text-xl text-gray-600 dark:text-dark-text-secondary mb-4">
                {car.brand} • {car.year}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(car.pricePerDay)}
                </span>
                <span className="text-xl text-gray-600 dark:text-dark-text-secondary">/day</span>
              </div>
            </div>

            {/* Availability Notice */}
            {!car.available && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-400 font-semibold">Just sold or temporarily unavailable</p>
                <p className="text-red-600 dark:text-red-500 text-sm mt-1">Inventory updates propagate within minutes.</p>
              </div>
            )}

            {/* Specifications Accordion */}
            <SpecsAccordion car={car} />

            {/* Description */}
            {car.description && (
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-default shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-dark-text-secondary leading-relaxed text-lg whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* Similar Cars */}
            {similarCars && similarCars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
                  Similar Cars You Might Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {similarCars.map((similarCar) => (
                    <CarCard key={similarCar.id} car={similarCar} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <SellerCard
              seller={car.seller}
              onMessage={handleMessageSeller}
              onContact={handleMessageSeller}
            />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-default shadow-lg space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/booking/${car.id}`)}
                disabled={!car.available}
                className="w-full"
              >
                {car.available ? 'Book This Car' : 'Currently Unavailable'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<MessageCircle size={18} />}
                onClick={handleMessageSeller}
                className="w-full"
              >
                Message Seller
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <StickyCTA
        car={car}
        isAuthenticated={isAuthenticated}
        onMessageSeller={handleMessageSeller}
        onBookTestDrive={handleBookTestDrive}
        onFinanceEstimate={handleFinanceEstimate}
      />
    </div>
  )
}

export default CarDetail

