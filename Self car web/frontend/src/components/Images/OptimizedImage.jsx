/**
 * OptimizedImage Component (FE-100)
 * 
 * Responsive image component with:
 * - CDN optimization
 * - WebP/AVIF support
 * - Lazy/priority loading
 * - Responsive srcset
 */

import { useState, useEffect, useRef } from 'react'
import {
  getOptimizedImageUrl,
  getResponsiveSrcSet,
  getResponsiveSizes,
  lazyLoadImage,
} from '../../utils/imageCDN'

/**
 * OptimizedImage Component
 * 
 * @param {string} src - Original image URL
 * @param {string} alt - Alt text (required for accessibility)
 * @param {string} context - Image context ('thumbnail' | 'card' | 'detail' | 'gallery' | 'hero')
 * @param {boolean} priority - Whether to load with high priority (for above-the-fold images)
 * @param {boolean} lazy - Whether to lazy load (default: true unless priority is true)
 * @param {number} width - Specific width (overrides context-based width)
 * @param {number} height - Specific height
 * @param {string} className - Additional CSS classes
 * @param {Object} ...props - Other img attributes
 */
const OptimizedImage = ({
  src,
  alt,
  context = 'card',
  priority = false,
  lazy = !priority,
  width,
  height,
  className = '',
  fit = 'cover', // "cover" | "contain"
  ratio,         // e.g. "16/9" | "4/3" | "1/1"
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, {
    context,
    width,
    height,
    format: 'auto',
  })

  const srcSet = getResponsiveSrcSet(src, context)
  const sizes = getResponsiveSizes(context)

  // Lazy load if enabled
  useEffect(() => {
    if (lazy && imgRef.current) {
      return lazyLoadImage(imgRef.current, src, {
        context,
        width,
        height,
      })
    }
  }, [lazy, src, context, width, height])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Handle image error
  const handleError = () => {
    setError(true)
  }

  // If error, show fallback
  if (error) {
    return (
      <div
        className={`bg-gray-200 dark:bg-dark-bg-tertiary flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      ref={imgRef}
      src={priority ? optimizedSrc : undefined}
      srcSet={priority ? srcSet : undefined}
      sizes={priority ? sizes : undefined}
      alt={alt || ''}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      width={width}
      height={height}
      className={
        `img-fluid ${fit === 'contain' ? 'img-contain' : 'img-cover'} ` +
        `${ratio ? `aspect-[${ratio}]` : ''} ` +
        `transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`
      }
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}

export default OptimizedImage

