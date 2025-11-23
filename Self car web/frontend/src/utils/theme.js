/**
 * Theme Utilities
 * 
 * Handles theme detection, persistence, and system preference detection.
 * SSR-safe implementation to prevent flash of wrong theme.
 */

/**
 * Get system theme preference
 */
export function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : null
  } catch (error) {
    console.error('Error reading theme from localStorage:', error)
    return null
  }
}

/**
 * Get effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(theme) {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme || 'light'
}

/**
 * Apply theme to document
 * SSR-safe: applies theme before React hydration
 * Performance optimized: Uses CSS variables and minimal DOM manipulation
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  
  const effectiveTheme = getEffectiveTheme(theme)
  const root = document.documentElement
  
  // Use requestAnimationFrame for smooth theme transitions
  // and to batch DOM updates
  requestAnimationFrame(() => {
    // Remove existing theme classes (only if different)
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light'
    if (currentTheme !== effectiveTheme) {
      root.classList.remove('light', 'dark')
      // Add new theme class
      root.classList.add(effectiveTheme)
    }
    
    // Set data attribute for CSS variable access
    root.setAttribute('data-theme', effectiveTheme)
    
    // Store theme preference (async, non-blocking)
    try {
      localStorage.setItem('theme', theme || 'system')
    } catch (error) {
      console.error('Error storing theme:', error)
    }
    
    // Announce theme change to screen readers
    announceThemeChange(effectiveTheme)
  })
}

/**
 * Announce theme change to screen readers
 */
function announceThemeChange(theme) {
  if (typeof document === 'undefined') return
  
  // Create or update aria-live region for theme announcements
  let announcer = document.getElementById('theme-announcer')
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'theme-announcer'
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;'
    document.body.appendChild(announcer)
  }
  
  const themeNames = {
    light: 'Light theme',
    dark: 'Dark theme',
  }
  
  announcer.textContent = `Theme changed to ${themeNames[theme] || theme}`
  
  // Clear after announcement
  setTimeout(() => {
    if (announcer) announcer.textContent = ''
  }, 1000)
}

/**
 * Initialize theme on page load
 * Must be called before React hydration to prevent flash
 */
export function initTheme() {
  if (typeof document === 'undefined') return
  
  // Get theme from localStorage or default to system
  const storedTheme = getStoredTheme() || 'system'
  
  // Apply theme immediately
  applyTheme(storedTheme)
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const currentTheme = getStoredTheme() || 'system'
      if (currentTheme === 'system') {
        applyTheme('system')
      }
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }
  }
}

/**
 * Subscribe to system theme changes
 */
export function subscribeToSystemTheme(callback) {
  if (typeof window === 'undefined') return () => {}
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e) => {
    callback(e.matches ? 'dark' : 'light')
  }
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  } else {
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }
}

export default {
  getSystemTheme,
  getStoredTheme,
  getEffectiveTheme,
  applyTheme,
  initTheme,
  subscribeToSystemTheme,
}

