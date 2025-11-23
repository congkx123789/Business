import { useEffect, useRef } from 'react'

/**
 * Focus Management Hook
 * Manages focus for accessibility, especially for modals and route changes
 */

/**
 * Hook to trap focus within a container (e.g., modal)
 * @param {boolean} isActive - Whether the focus trap should be active
 * @param {HTMLElement} containerRef - Ref to the container element
 */
export const useFocusTrap = (isActive, containerRef) => {
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstFocusableRef.current = firstElement
    lastFocusableRef.current = lastElement

    // Focus first element
    firstElement.focus()

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive, containerRef])
}

/**
 * Hook to manage focus on mount/unmount
 * @param {boolean} shouldFocus - Whether to focus on mount
 * @param {HTMLElement} elementRef - Ref to the element to focus
 */
export const useAutoFocus = (shouldFocus, elementRef) => {
  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus()
    }
  }, [shouldFocus, elementRef])
}

/**
 * Hook to restore focus to previous element
 * Useful for modals - restore focus when modal closes
 */
export const useRestoreFocus = (isActive) => {
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement
    } else {
      // Restore focus when inactive
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive])
}

export default {
  useFocusTrap,
  useAutoFocus,
  useRestoreFocus,
}

