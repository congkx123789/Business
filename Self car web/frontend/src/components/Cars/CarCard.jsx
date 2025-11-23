import React, { memo, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Settings, Fuel, Star, Sparkles, Car, CheckCircle, Flame, Star as NewIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getCardImageUrl, getResponsiveSrcSet, getResponsiveSizes } from '../../utils/imageCDN'
import { usePrefetchCar } from '../../hooks/usePrefetch'
import { useLocale } from '../../hooks/useLocale'
import { useMotionProps } from '../../hooks/useMotion'

/**
 * CarCard - Displays a car card with modern, beautiful design
 * @param {Object} car - Car object matching Car type from api.ts
 * @param {number} car.id - Car ID
 * @param {string} car.name - Car name
 * @param {string} car.brand - Car brand
 * @param {number} car.year - Car year
 * @param {string|number} car.pricePerDay - Price per day
 * @param {number} car.seats - Number of seats
 * @param {string} car.transmission - Transmission type (AUTOMATIC/MANUAL)
 * @param {string} car.fuelType - Fuel type (PETROL/DIESEL/ELECTRIC/HYBRID)
 * @param {string} car.type - Car type (SEDAN/SUV/SPORTS/LUXURY/VAN)
 * @param {string|null} car.imageUrl - Car image URL
 * @param {boolean} car.featured - Whether car is featured
 * @param {boolean} car.available - Whether car is available
 */
const CarCard = ({ car }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imgRef = useRef(null)
  const { prefetchCar } = usePrefetchCar()
  const { t } = useTranslation()
  const { formatPrice } = useLocale()

  // Lazy load image using Intersection Observer
  useEffect(() => {
    const img = imgRef.current
    if (!img || !car.imageUrl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load image when it enters viewport
            const imageLoader = new Image()
            const optimizedUrl = getCardImageUrl(car.imageUrl)
            imageLoader.src = optimizedUrl
            imageLoader.onload = () => {
              setImageLoaded(true)
              if (img) {
                img.src = optimizedUrl
              }
            }
            imageLoader.onerror = () => {
              setImageError(true)
            }
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    )

    observer.observe(img)

    return () => {
      if (img) {
        observer.unobserve(img)
      }
    }
  }, [car.imageUrl])

  const price = typeof car.pricePerDay === 'string' 
    ? parseFloat(car.pricePerDay) 
    : car.pricePerDay

  const getTransmissionLabel = (transmission) => {
    return transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'
  }

  const getFuelTypeLabel = (fuelType) => {
    const labels = {
      PETROL: 'Petrol',
      DIESEL: 'Diesel',
      ELECTRIC: 'Electric',
      HYBRID: 'Hybrid',
    }
    return labels[fuelType] || fuelType
  }

  // Determine badges (Verified/Hot/New)
  const isNew = car.year && new Date().getFullYear() - car.year <= 1
  const isHot = car.featured || (car.pricePerDay && typeof car.pricePerDay === 'number' && car.pricePerDay < 50)
  const isVerified = car.verified || car.sellerVerified

  const motionProps = useMotionProps({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    whileHover: { y: -8, scale: 1.02 },
  })

  return (
    <motion.div
      {...motionProps}
      className="card group cursor-pointer relative overflow-hidden"
    >
      {/* Badges - Fixed ratios, positioned consistently */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Verified Badge */}
        {isVerified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md border border-white/20"
            title={t('common:cars.badges.verifiedTitle') || 'Verified Seller'}
          >
            <CheckCircle size={12} />
            <span>{t('common:cars.badges.verified') || 'Verified'}</span>
          </motion.div>
        )}
        
        {/* Hot Badge */}
        {isHot && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md border border-white/20"
            title={t('common:cars.badges.hotTitle') || 'Hot Deal'}
          >
            <Flame size={12} />
            <span>{t('common:cars.badges.hot') || 'Hot'}</span>
          </motion.div>
        )}
        
        {/* New Badge */}
        {isNew && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md border border-white/20"
            title={t('common:cars.badges.newTitle') || 'New Vehicle'}
          >
            <NewIcon size={12} />
            <span>{t('common:cars.badges.new') || 'New'}</span>
          </motion.div>
        )}
      </div>

      {/* Featured Badge - Top Right */}
      {car.featured && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="absolute top-3 right-3 z-10"
        >
          <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md border border-white/20 pulse-glow">
            <Sparkles size={12} />
            {t('common:cars.featured')}
          </div>
        </motion.div>
      )}

      {/* Availability Badge - Bottom Left */}
      {!car.available && (
        <div className="absolute bottom-3 left-3 z-10 bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
          {t('common:cars.unavailable')}
        </div>
      )}

      <Link 
        to={`/cars/${car.id}`} 
        className="block"
        onMouseEnter={() => prefetchCar(car.id)}
      >
        {/* Image with Lazy Loading - Fixed 16:9 aspect ratio, progressive loading */}
        <div className="relative aspect-[16/9] mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-dark-bg-tertiary dark:via-dark-bg-secondary dark:to-dark-bg-elevated shadow-xl group-hover:shadow-2xl transition-all duration-300 ease-out border border-gray-200/50 dark:border-gray-700/50">
          {car.imageUrl && !imageError ? (
            <>
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                  <div className="text-gray-400">
                    <Car className="mx-auto mb-2 text-gray-300" size={32} />
                  </div>
                </div>
              )}
              {/* Lazy-loaded image with smooth zoom effect */}
              <img
                ref={imgRef}
                src={getCardImageUrl(car.imageUrl)}
                srcSet={getResponsiveSrcSet(car.imageUrl, 'card')}
                sizes={getResponsiveSizes('card')}
                alt={car.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Car className="mx-auto mb-2 text-gray-300" size={48} />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                {car.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-0.5">
                {car.brand} • {car.year}
              </p>
            </div>
            <div className="flex items-center space-x-1 text-yellow-500 ml-2 flex-shrink-0">
              <Star size={16} fill="currentColor" />
              <span className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                4.5
              </span>
            </div>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-text-secondary flex-wrap">
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-bg-tertiary dark:to-dark-bg-secondary px-3 py-1.5 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/30">
              <Users size={14} className="text-primary-600" />
              <span className="font-medium">{car.seats}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-bg-tertiary dark:to-dark-bg-secondary px-3 py-1.5 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/30">
              <Settings size={14} className="text-primary-600" />
              <span className="font-medium">{getTransmissionLabel(car.transmission)}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-bg-tertiary dark:to-dark-bg-secondary px-3 py-1.5 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/30">
              <Fuel size={14} className="text-primary-600" />
              <span className="font-medium">{getFuelTypeLabel(car.fuelType)}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border-default">
            <div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(price)}
              </span>
              <span className="text-gray-500 dark:text-dark-text-tertiary text-sm ml-1">{t('common:booking.perDay')}</span>
            </div>
            <button 
              className="btn-primary text-sm px-4 py-2"
              disabled={!car.available}
              onClick={(e) => {
                if (!car.available) {
                  e.preventDefault()
                }
              }}
            >
              {car.available ? t('common:cars.bookNow') : t('common:cars.unavailable')}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default memo(CarCard)

