/**
 * Accessibility Utilities (FE-110)
 * 
 * WCAG 2.2 AA compliance utilities:
 * - Keyboard trap management
 * - Focus order management
 * - Color contrast checking
 * - ARIA attribute helpers
 */

/**
 * Check color contrast ratio (FE-110)
 * Returns contrast ratio between two colors
 * WCAG 2.2 AA requires:
 * - 4.5:1 for normal text
 * - 3:1 for large text
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    // Apply gamma correction
    const [rLinear, gLinear, bLinear] = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    
    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if color combination meets WCAG AA standards (FE-110)
 */
export const meetsWCAGAA = (foreground, background, isLargeText = false) => {
  const ratio = getContrastRatio(foreground, background)
  const requiredRatio = isLargeText ? 3 : 4.5
  return ratio >= requiredRatio
}

/**
 * Check if color combination meets WCAG AAA standards (FE-110)
 */
export const meetsWCAGAAA = (foreground, background, isLargeText = false) => {
  const ratio = getContrastRatio(foreground, background)
  const requiredRatio = isLargeText ? 4.5 : 7
  return ratio >= requiredRatio
}

/**
 * Ensure keyboard trap for modal/dialog (FE-110)
 * WCAG 2.4.3: Focus Order
 */
export const ensureKeyboardTrap = (containerElement) => {
  if (!containerElement) return () => {}
  
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length === 0) return () => {}
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  // Focus first element
  firstElement.focus()
  
  const handleKeyDown = (e) => {
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
  
  containerElement.addEventListener('keydown', handleKeyDown)
  
  return () => {
    containerElement.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Ensure focus order (FE-110)
 * WCAG 2.4.3: Focus Order
 */
export const ensureFocusOrder = (elements) => {
  elements.forEach((element, index) => {
    if (element) {
      element.setAttribute('tabindex', index === 0 ? '0' : '-1')
    }
  })
}

/**
 * Announce to screen readers (FE-110)
 * WCAG 4.1.3: Status Messages
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Ensure all images have alt text (FE-110)
 * WCAG 1.1.1: Non-text Content
 */
export const ensureImageAltText = () => {
  const images = document.querySelectorAll('img')
  images.forEach((img) => {
    if (!img.alt && !img.getAttribute('aria-hidden')) {
      console.warn('Image missing alt text:', img.src)
      // In production, you might want to set a default alt or mark as decorative
      img.setAttribute('alt', '')
      img.setAttribute('aria-hidden', 'true')
    }
  })
}

/**
 * Ensure all interactive elements are keyboard accessible (FE-110)
 * WCAG 2.1.1: Keyboard
 */
export const ensureKeyboardAccessibility = () => {
  const interactiveElements = document.querySelectorAll(
    'button, [role="button"], a, input, select, textarea'
  )
  
  interactiveElements.forEach((element) => {
    // Ensure element is focusable
    if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0')
    }
    
    // Ensure element has accessible name
    const accessibleName = element.getAttribute('aria-label') ||
                          element.getAttribute('aria-labelledby') ||
                          element.textContent?.trim() ||
                          element.getAttribute('alt') ||
                          element.getAttribute('title')
    
    if (!accessibleName && element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
      console.warn('Interactive element missing accessible name:', element)
    }
  })
}

/**
 * Run accessibility audit (FE-110)
 */
export const runAccessibilityAudit = () => {
  if (typeof window === 'undefined') return
  
  const issues = []
  
  // Check images
  ensureImageAltText()
  
  // Check keyboard accessibility
  ensureKeyboardAccessibility()
  
  // Check color contrast (basic check)
  const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button')
  textElements.forEach((element) => {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const bgColor = styles.backgroundColor
    
    // Basic contrast check (simplified)
    // In production, use a proper contrast checker library
    if (color && bgColor && color !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
      // This is a simplified check - use a proper library for production
      const contrast = getContrastRatio(color, bgColor)
      if (contrast < 4.5) {
        issues.push({
          type: 'contrast',
          element,
          contrast,
          message: `Low contrast ratio: ${contrast.toFixed(2)}:1`,
        })
      }
    }
  })
  
  return issues
}

/**
 * Initialize accessibility enhancements (FE-110)
 */
export const initAccessibility = () => {
  if (typeof window === 'undefined') return
  
  // Run audit on load
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      const issues = runAccessibilityAudit()
      if (issues.length > 0) {
        console.warn('Accessibility issues found:', issues)
      }
    })
  }
}

export default {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  ensureKeyboardTrap,
  ensureFocusOrder,
  announceToScreenReader,
  ensureImageAltText,
  ensureKeyboardAccessibility,
  runAccessibilityAudit,
  initAccessibility,
}

