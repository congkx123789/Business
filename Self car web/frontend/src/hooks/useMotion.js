/**
 * Motion Hook (FE-120)
 * 
 * Provides motion utilities with reduced-motion support
 * Respects prefers-reduced-motion for accessibility
 */

import { useEffect, useState } from 'react'

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Get motion props based on reduced-motion preference
 * @param {Object} props - Motion props (initial, animate, transition, etc.)
 * @returns {Object} Motion props with reduced-motion fallback
 */
export const useMotionProps = (props = {}) => {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    // Return minimal motion: only opacity changes
    return {
      initial: { opacity: props.initial?.opacity ?? 0 },
      animate: { opacity: props.animate?.opacity ?? 1 },
      exit: { opacity: props.exit?.opacity ?? 0 },
      transition: { duration: 0 },
      ...props,
      // Disable any transform/scale animations
      whileHover: undefined,
      whileTap: undefined,
      whileInView: undefined,
    }
  }

  return props
}

/**
 * Get transition duration from tokens
 * @param {string} type - 'ui' | 'uiSlow' | 'entrance' | 'entranceSlow' | 'exit'
 * @returns {number} Duration in seconds
 */
export const useTransitionDuration = (type = 'ui') => {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return 0
  }

  const durations = {
    ui: 0.12,
    uiSlow: 0.2,
    entrance: 0.2,
    entranceSlow: 0.3,
    exit: 0.15,
  }

  return durations[type] ?? 0.2
}

