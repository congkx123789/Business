import { useParams, useNavigate } from 'react-router-dom'
import { useCar } from '../hooks/useCars'
import { useSimilarCars } from '../hooks/useSimilarCars'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useMessageStore from '../store/messageStore'
import toast from 'react-hot-toast'
import { Spinner } from '../components/Shared/LoadingSkeleton'
import { ErrorState } from '../components/Shared/ErrorState'
import { EmptyCarDetail } from '../components/Shared/EmptyState'
import { getVDPImageUrl, getResponsiveSrcSet, getResponsiveSizes, preloadImage } from '../utils/imageCDN'
import { trackPDPLatency, trackPDPEvent } from '../utils/metrics'
import CarCard from '../components/Cars/CarCard'
import ImageGallery from '../components/Cars/ImageGallery'
import StickyCTA from '../components/Cars/StickyCTA'
import SpecsAccordion from '../components/Cars/SpecsAccordion'
import SellerCard from '../components/Cars/SellerCard'
import { useEffect, useRef, useMemo } from 'react'

const CarDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { conversations, createConversation, setActiveConversation } = useMessageStore()

  const { data: car, isLoading, error, refetch } = useCar(id)
  const { data: similarCars } = useSimilarCars(id)
  const loadTimeRef = useRef(Date.now())

  // Track PDP latency (Phase 10)
  useEffect(() => {
    if (car && !isLoading) {
      const loadTime = Date.now() - loadTimeRef.current
      trackPDPLatency(id, loadTime)
      trackPDPEvent('pdp_viewed', { carId: id, carName: car.name })
    }
  }, [car, id, isLoading])

  // Prepare images array for gallery
  const galleryImages = useMemo(() => {
    if (!car) return []
    const images = []
    if (car.imageUrl) {
      images.push(getVDPImageUrl(car.imageUrl, true))
    }
    // Add additional images if available (from car.images array)
    if (car.images && Array.isArray(car.images)) {
      car.images.forEach(img => {
        if (img && img !== car.imageUrl) {
          images.push(getVDPImageUrl(img, true))
        }
      })
    }
    // If no images, add placeholder
    if (images.length === 0) {
      images.push('/placeholder-car.jpg')
    }
    return images
  }, [car])

  // Preload primary image for better LCP
  useEffect(() => {
    if (car?.imageUrl) {
      preloadImage(car.imageUrl, { context: 'detail', isPrimary: true })
    }
  }, [car?.imageUrl])

  const handleMessageSeller = () => {
    trackPDPEvent('contact_seller_clicked', { carId: car?.id, carName: car?.name })
    
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
      trackPDPEvent('conversation_opened', { carId: car?.id })
    } else {
      const newConvId = createConversation([
        { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role },
        adminUser
      ])
      navigate('/messages')
      toast.success('Conversation started with seller')
      trackPDPEvent('conversation_created', { carId: car?.id })
    }
  }

  const handleBookTestDrive = () => {
    trackPDPEvent('test_drive_clicked', { carId: car?.id, carName: car?.name })
    toast.info('Test drive booking feature coming soon!')
  }

  const handleFinanceEstimate = () => {
    trackPDPEvent('finance_estimate_clicked', { carId: car?.id, carName: car?.name })
    toast.info('Finance calculator feature coming soon!')
  }

  const handleBook = () => {
    trackPDPEvent('book_clicked', { carId: car?.id, carName: car?.name })
    navigate(`/booking/${car?.id}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cars')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors group"
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
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery (FE-060) */}
            <ImageGallery 
              images={galleryImages}
              primaryImageIndex={0}
              carName={car.name}
            />

            {/* Specifications Accordion (FE-062) */}
            <SpecsAccordion car={car} />
          </div>

          {/* Right Column - Summary & Seller Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sticky Summary Card */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {!car.available && (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-red-700 dark:text-red-400 font-semibold">Just sold or temporarily unavailable</p>
                  <p className="text-red-600 dark:text-red-500 text-sm">Inventory updates propagate within minutes.</p>
                </div>
              )}
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">{car.name}</h1>
                <p className="text-lg text-gray-600 dark:text-dark-text-secondary">{car.brand} • {car.year}</p>
              </div>

              {/* Price - Enhanced with modern gradient */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 border-0 shadow-2xl"
              >
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white drop-shadow-lg">
                    {formatPrice(car.pricePerDay)}
                  </span>
                  <span className="text-white/90 text-lg ml-3 font-medium">/day</span>
                </div>
              </motion.div>

              {/* Description */}
              {car.description && (
                <div className="card">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-dark-text-primary">Description</h3>
                  <p className="text-gray-700 dark:text-dark-text-secondary leading-relaxed">{car.description}</p>
                </div>
              )}

              {/* Seller Card (FE-062) */}
              <SellerCard 
                seller={car.seller}
                onContact={handleMessageSeller}
                onMessage={handleMessageSeller}
              />
            </div>
          </div>
        </motion.div>

        {/* Similar Cars Section - Bonus Feature */}
        {similarCars && similarCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Similar Cars You Might Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarCars.map((similarCar) => (
                <CarCard key={similarCar.id} car={similarCar} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Sticky CTA Bar (FE-061) */}
        <StickyCTA
          car={car}
          isAuthenticated={isAuthenticated}
          onMessageSeller={handleMessageSeller}
          onBookTestDrive={handleBookTestDrive}
          onFinanceEstimate={handleFinanceEstimate}
        />
      </div>
    </div>
  )
}

export default CarDetail
