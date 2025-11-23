/**
 * Image CDN Utility
 * Generates optimized CDN URLs with responsive sizes, modern formats (WebP/AVIF), and compression
 */

const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.selfcar.com'
const CDN_ENABLED = import.meta.env.VITE_CDN_ENABLED === 'true'

/**
 * Check if URL is already a CDN URL
 */
const isCDNUrl = (url) => {
  if (!url) return false
  return url.includes('cloudfront') || 
         url.includes('cdn.selfcar.com') || 
         url.includes('amazonaws.com') ||
         url.includes('s3.amazonaws.com')
}

/**
 * Check if URL is an S3 URL that needs CDN transformation
 */
const isS3Url = (url) => {
  if (!url) return false
  return url.includes('s3.amazonaws.com') || 
         url.includes('s3.') || 
         url.match(/\.s3[.-]/)
}

/**
 * Get optimal image format based on browser support
 */
const getOptimalFormat = () => {
  if (typeof document === 'undefined') return 'webp'
  
  // Check AVIF support
  const avifSupported = document.createElement('canvas')
    .toDataURL('image/avif').indexOf('data:image/avif') === 0
  
  if (avifSupported) return 'avif'
  
  // Check WebP support
  const webpSupported = document.createElement('canvas')
    .toDataURL('image/webp').indexOf('data:image/webp') === 0
  
  if (webpSupported) return 'webp'
  
  return 'jpg' // Fallback to original format
}

/**
 * Get responsive width based on viewport and context
 * @param {string} context - 'thumbnail' | 'card' | 'detail' | 'gallery'
 * @param {number} multiplier - Optional multiplier for high-DPI displays
 */
const getResponsiveWidth = (context = 'card', multiplier = 1) => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  
  // Base widths for different contexts
  const baseWidths = {
    thumbnail: 150,   // Thumbnail images
    card: 400,        // Car cards in listings
    detail: 800,      // Main detail image
    gallery: 1200,    // Full gallery images
    hero: 1920        // Hero/banner images
  }
  
  const baseWidth = baseWidths[context] || baseWidths.card
  
  // Responsive breakpoints
  if (viewportWidth < 640) {
    // Mobile
    return Math.round(baseWidth * 0.75 * multiplier)
  } else if (viewportWidth < 1024) {
    // Tablet
    return Math.round(baseWidth * 0.9 * multiplier)
  } else {
    // Desktop
    return Math.round(baseWidth * multiplier)
  }
}

/**
 * Build CDN URL with optimization parameters
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 * @param {string} options.context - Image context ('thumbnail' | 'card' | 'detail' | 'gallery')
 * @param {number} options.width - Specific width (overrides context-based width)
 * @param {number} options.height - Optional height
 * @param {string} options.format - Image format ('auto' | 'webp' | 'avif' | 'jpg' | 'png')
 * @param {number} options.quality - Quality (1-100, default: 85)
 * @param {boolean} options.focus - Enable focus/face detection for cropping
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return null
  
  // If CDN is disabled or URL is already a CDN URL, return as-is
  if (!CDN_ENABLED || isCDNUrl(imageUrl)) {
    return imageUrl
  }
  
  // If it's an S3 URL, extract the key
  let imageKey = imageUrl
  if (isS3Url(imageUrl)) {
    // Extract S3 key from URL
    const s3Match = imageUrl.match(/s3[.-][^/]+\.amazonaws\.com\/(.+)/)
    if (s3Match) {
      imageKey = s3Match[1]
    } else {
      // Return as-is if we can't parse it
      return imageUrl
    }
  } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // If it's a full URL but not S3, we might need to proxy it through CDN
    // For now, return as-is (you might want to implement a proxy endpoint)
    return imageUrl
  }
  
  // Build CDN URL
  const params = new URLSearchParams()
  
  // Width
  const width = options.width || getResponsiveWidth(options.context || 'card')
  params.set('width', width.toString())
  
  // Height (optional)
  if (options.height) {
    params.set('height', options.height.toString())
  }
  
  // Format
  const format = options.format === 'auto' 
    ? getOptimalFormat() 
    : (options.format || 'auto')
  if (format !== 'auto') {
    params.set('format', format)
  }
  
  // Quality (default: 85)
  const quality = options.quality || 85
  if (quality !== 85) {
    params.set('quality', quality.toString())
  }
  
  // Focus/face detection
  if (options.focus) {
    params.set('focus', 'auto')
  }
  
  // Build final URL
  const cdnUrl = `${CDN_BASE_URL}/${imageKey}?${params.toString()}`
  return cdnUrl
}

/**
 * Generate srcset for responsive images
 * @param {string} imageUrl - Original image URL
 * @param {string} context - Image context
 * @param {Array<number>} widths - Array of widths to generate
 */
export const getResponsiveSrcSet = (imageUrl, context = 'card', widths = null) => {
  if (!imageUrl) return ''
  
  // Default widths based on context
  const defaultWidths = {
    thumbnail: [150, 300],
    card: [400, 800, 1200],
    detail: [800, 1200, 1600],
    gallery: [800, 1200, 1920],
    hero: [1200, 1920, 2560]
  }
  
  const widthsToUse = widths || defaultWidths[context] || defaultWidths.card
  
  return widthsToUse
    .map(width => {
      const url = getOptimizedImageUrl(imageUrl, { context, width })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 * @param {string} context - Image context
 */
export const getResponsiveSizes = (context = 'card') => {
  const sizesMap = {
    thumbnail: '150px',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
    detail: '(max-width: 1024px) 100vw, 800px',
    gallery: '(max-width: 1024px) 100vw, 1200px',
    hero: '100vw'
  }
  
  return sizesMap[context] || sizesMap.card
}

/**
 * Preload optimized image (FE-100)
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 */
export const preloadImage = (imageUrl, options = {}) => {
  if (!imageUrl || typeof document === 'undefined') return
  
  const optimizedUrl = getOptimizedImageUrl(imageUrl, options)
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = optimizedUrl
  link.crossOrigin = 'anonymous'
  
  // Add fetchpriority for priority loading (FE-100)
  if (options.priority === 'high') {
    link.setAttribute('fetchpriority', 'high')
  }
  
  document.head.appendChild(link)
}

/**
 * Lazy load image with Intersection Observer (FE-100)
 * @param {HTMLElement} imgElement - Image element
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 */
export const lazyLoadImage = (imgElement, imageUrl, options = {}) => {
  if (!imgElement || !imageUrl || typeof window === 'undefined') return
  
  // If IntersectionObserver is not supported, load immediately
  if (!('IntersectionObserver' in window)) {
    const optimizedUrl = getOptimizedImageUrl(imageUrl, options)
    imgElement.src = optimizedUrl
    return
  }
  
  // Set placeholder or data-src
  imgElement.setAttribute('data-src', getOptimizedImageUrl(imageUrl, options))
  imgElement.setAttribute('loading', 'lazy')
  
  // Add blur placeholder if specified
  if (options.placeholder) {
    imgElement.style.backgroundImage = `url(${options.placeholder})`
    imgElement.style.backgroundSize = 'cover'
    imgElement.style.filter = 'blur(10px)'
    imgElement.style.transition = 'filter 0.3s'
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const src = entry.target.getAttribute('data-src')
          if (src) {
            entry.target.src = src
            entry.target.removeAttribute('data-src')
            entry.target.style.filter = 'none'
            observer.unobserve(entry.target)
          }
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before image enters viewport
    }
  )
  
  observer.observe(imgElement)
  
  return () => observer.disconnect()
}

/**
 * Get optimized image URL for Car Detail Page (VDP) - priority implementation
 * @param {string} imageUrl - Original image URL
 * @param {boolean} isPrimary - Whether this is the primary/hero image
 */
export const getVDPImageUrl = (imageUrl, isPrimary = false) => {
  return getOptimizedImageUrl(imageUrl, {
    context: isPrimary ? 'detail' : 'gallery',
    format: 'auto',
    quality: 85,
    focus: isPrimary // Enable face detection for primary images
  })
}

/**
 * Get optimized image URL for Car Card
 * @param {string} imageUrl - Original image URL
 */
export const getCardImageUrl = (imageUrl) => {
  return getOptimizedImageUrl(imageUrl, {
    context: 'card',
    format: 'auto',
    quality: 80 // Slightly lower quality for cards
  })
}

export default {
  getOptimizedImageUrl,
  getResponsiveSrcSet,
  getResponsiveSizes,
  preloadImage,
  getVDPImageUrl,
  getCardImageUrl,
  isCDNUrl,
  isS3Url
}

