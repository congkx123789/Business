import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionProps } from '../../hooks/useMotion'

/**
 * ImageGallery Component (FE-060) - Week 12 Enhanced
 * 
 * Media gallery with:
 * - Thumbnail navigation
 * - Zoom functionality (mouse wheel, pinch, keyboard)
 * - Lightbox mode with full keyboard support
 * - 360 hook for future 360-degree images
 * - Aspect-ratio safe images
 * - Primary image selection
 * - Graceful fallbacks
 * - Touch support for mobile
 */
const ImageGallery = ({ images = [], primaryImageIndex = 0, carName = '', has360View = false, on360ViewRequest }) => {
  const [selectedIndex, setSelectedIndex] = useState(primaryImageIndex)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imageRef = useRef(null)
  const lightboxImageRef = useRef(null)
  const galleryRef = useRef(null)

  // Ensure selectedIndex is within bounds
  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(0)
    }
  }, [selectedIndex, images.length])

  // Reset zoom when changing images
  useEffect(() => {
    setZoomLevel(1)
    setLightboxZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }, [selectedIndex])

  // Keyboard navigation - Enhanced for both gallery and lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (isLightboxOpen) {
        // Lightbox keyboard controls
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePrevious()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNext()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setIsLightboxOpen(false)
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          handleZoomIn()
        } else if (e.key === '-') {
          e.preventDefault()
          handleZoomOut()
        } else if (e.key === '0') {
          e.preventDefault()
          handleResetZoom()
        }
      } else {
        // Gallery view keyboard controls
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePrevious()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNext()
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsLightboxOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, selectedIndex])

  // Mouse wheel zoom
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          handleZoomIn()
        } else {
          handleZoomOut()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isLightboxOpen, lightboxZoom])

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleZoomIn = () => {
    if (isLightboxOpen) {
      setLightboxZoom((prev) => Math.min(prev + 0.25, 3))
    } else {
      setZoomLevel((prev) => Math.min(prev + 0.25, 3))
    }
  }

  const handleZoomOut = () => {
    if (isLightboxOpen) {
      setLightboxZoom((prev) => Math.max(prev - 0.25, 1))
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.25, 1))
    }
  }

  const handleResetZoom = () => {
    if (isLightboxOpen) {
      setLightboxZoom(1)
    } else {
      setZoomLevel(1)
    }
    setImagePosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 1 || lightboxZoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && (zoomLevel > 1 || lightboxZoom > 1)) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch support for mobile zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      setDragStart({ distance, x: 0, y: 0 })
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && dragStart.distance) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      const scale = distance / dragStart.distance
      const newZoom = isLightboxOpen ? lightboxZoom * scale : zoomLevel * scale
      const clampedZoom = Math.max(1, Math.min(3, newZoom))
      
      if (isLightboxOpen) {
        setLightboxZoom(clampedZoom)
      } else {
        setZoomLevel(clampedZoom)
      }
    }
  }

  const handleTouchEnd = () => {
    setDragStart({ x: 0, y: 0, distance: null })
  }

  // Handle 360 view request
  const handle360View = () => {
    if (on360ViewRequest) {
      on360ViewRequest(selectedIndex)
    } else {
      console.log('360 view requested for image', selectedIndex)
      // Placeholder for future 360 integration
    }
  }

  // Image load handlers
  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const currentImage = images[selectedIndex] || images[0]

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-dark-bg-tertiary rounded-2xl flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500 dark:text-dark-text-tertiary mb-2">No images available</p>
          <p className="text-sm text-gray-400 dark:text-dark-text-tertiary">
            Images will appear here when available
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Primary Image */}
        <div
          ref={galleryRef}
          className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-dark-bg-tertiary rounded-2xl overflow-hidden cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="img"
          aria-label={`${carName} - Image ${selectedIndex + 1} of ${images.length}`}
        >
          {!imageError ? (
            <>
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary animate-pulse">
                  <div className="text-gray-400">
                    <RotateCw className="animate-spin mx-auto mb-2" size={32} />
                  </div>
                </div>
              )}
              <img
                ref={imageRef}
                src={currentImage}
                alt={`${carName} - Image ${selectedIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-[200ms] ease-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                  cursor: zoomLevel > 1 ? 'move' : 'zoom-in',
                }}
                loading="eager"
                fetchPriority="high"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary">
              <div className="text-center p-6">
                <p className="text-gray-500 dark:text-dark-text-tertiary mb-2">Failed to load image</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageError(false)
                    setImageLoaded(false)
                  }}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {/* 360 View Button */}
          {has360View && (
            <motion.button
              {...useMotionProps({
                whileHover: { scale: 1.1 },
                whileTap: { scale: 0.9 },
              })}
              onClick={(e) => {
                e.stopPropagation()
                handle360View()
              }}
              className="absolute top-4 left-4 bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary hover:bg-white dark:hover:bg-dark-bg-tertiary transition-colors z-10"
              aria-label="View 360 degree image"
            >
              <RotateCw size={16} />
              <span>360° View</span>
            </motion.button>
          )}
          
          {/* Zoom Controls */}
          {zoomLevel > 1 && (
            <div className="absolute top-4 right-4 flex gap-2 bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomOut()
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleResetZoom()
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded transition-colors"
                aria-label="Reset zoom"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomIn()
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-dark-bg-tertiary transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-dark-bg-tertiary transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800'
                    : 'border-gray-200 dark:border-dark-border-default hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={selectedIndex === index ? 'true' : 'false'}
              >
                <img
                  src={image}
                  alt={`${carName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomIn()
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                aria-label="Zoom in"
                title="Zoom in (+ or Ctrl+Scroll)"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomOut()
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                aria-label="Zoom out"
                title="Zoom out (- or Ctrl+Scroll)"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleResetZoom()
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                aria-label="Reset zoom"
                title="Reset zoom (0)"
              >
                <RotateCcw size={18} />
              </button>
              {has360View && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handle360View()
                  }}
                  className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                  aria-label="View 360 degree image"
                  title="360° View"
                >
                  <RotateCw size={18} />
                </button>
              )}
            </div>

            {/* Main Image */}
            <div
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <motion.img
                ref={lightboxImageRef}
                src={currentImage}
                alt={`${carName} - Image ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${lightboxZoom}) translate(${imagePosition.x / lightboxZoom}px, ${imagePosition.y / lightboxZoom}px)`,
                  cursor: lightboxZoom > 1 ? 'move' : 'default',
                }}
                {...useMotionProps({
                  initial: { scale: 0.9, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  exit: { scale: 0.9, opacity: 0 },
                  transition: { duration: 0.2 },
                })}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevious()
                    }}
                    className="absolute left-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                    className="absolute right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ImageGallery

