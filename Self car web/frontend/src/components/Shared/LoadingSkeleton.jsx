import { motion } from 'framer-motion'

/**
 * LoadingSkeleton - Beautiful animated skeleton loaders (FE-021)
 * 
 * Enhanced with shimmer effects and better animations
 */
export const LoadingSkeleton = ({ 
  className = '', 
  variant = 'default',
  count = 1,
  shimmer = true,
}) => {
  const variants = {
    default: 'h-4 bg-gray-200 dark:bg-dark-bg-tertiary rounded',
    card: 'h-64 bg-gray-200 dark:bg-dark-bg-tertiary rounded-xl',
    text: 'h-4 bg-gray-200 dark:bg-dark-bg-tertiary rounded',
    title: 'h-8 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-3/4',
    image: 'h-48 bg-gray-200 dark:bg-dark-bg-tertiary rounded-lg',
    button: 'h-10 bg-gray-200 dark:bg-dark-bg-tertiary rounded-lg w-24',
    circle: 'w-12 h-12 bg-gray-200 dark:bg-dark-bg-tertiary rounded-full',
    avatar: 'w-10 h-10 bg-gray-200 dark:bg-dark-bg-tertiary rounded-full',
  }

  const shimmerClass = shimmer 
    ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent dark:before:via-white/10' 
    : ''

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1,
          }}
          className={`${variants[variant] || variants.default} ${shimmerClass} ${className}`}
          aria-label="Loading"
          role="status"
          aria-live="polite"
        />
      ))}
    </>
  )
}

/**
 * CardSkeleton - Skeleton for car cards
 */
export const CardSkeleton = () => {
  return (
    <div className="card space-y-4">
      <LoadingSkeleton variant="image" />
      <div className="space-y-3">
        <LoadingSkeleton variant="title" />
        <LoadingSkeleton variant="text" />
        <div className="flex gap-4">
          <LoadingSkeleton variant="text" className="w-20" />
          <LoadingSkeleton variant="text" className="w-20" />
          <LoadingSkeleton variant="text" className="w-20" />
        </div>
        <div className="flex justify-between items-center pt-3">
          <LoadingSkeleton variant="text" className="w-24" />
          <LoadingSkeleton variant="button" />
        </div>
      </div>
    </div>
  )
}

/**
 * PageSkeleton - Full page skeleton
 */
export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          <LoadingSkeleton variant="title" className="h-10" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Spinner - Centered loading spinner
 */
export const Spinner = ({ size = 48, className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 rounded-full" />
      </motion.div>
    </div>
  )
}

export default LoadingSkeleton

