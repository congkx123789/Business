import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { usePreferencesStore } from '../../store/preferencesStore'
import { applyTheme, getEffectiveTheme, subscribeToSystemTheme } from '../../utils/theme'

/**
 * ThemeContext
 * Provides theme state and utilities to child components.
 */
const ThemeContext = createContext(null)

/**
 * ThemeProvider
 * 
 * Enhanced theme provider with SSR no-flash support and account persistence.
 * Integrates with PreferenceProvider for unified theme management.
 * 
 * Features:
 * - SSR-safe theme initialization (no flash of unstyled content)
 * - System theme detection and sync
 * - Account persistence via preferences store
 * - Instant theme switching
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.initialTheme - Optional initial theme from SSR
 */
export const ThemeProvider = ({ children, initialTheme = null }) => {
  const preferences = usePreferencesStore()
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize theme from SSR or preferences store
  useEffect(() => {
    if (initialTheme) {
      preferences.setTheme(initialTheme)
    }
    setIsHydrated(true)
  }, [initialTheme, preferences])

  // Subscribe to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const unsubscribe = subscribeToSystemTheme((theme) => {
      setSystemTheme(theme)
      // If user preference is 'system', apply the new system theme immediately
      if (preferences.theme === 'system') {
        applyTheme('system')
      }
    })

    return unsubscribe
  }, [preferences.theme])

  // Apply theme changes
  useEffect(() => {
    if (isHydrated) {
      applyTheme(preferences.theme)
    }
  }, [preferences.theme, isHydrated])

  // Compute effective theme
  const effectiveTheme = useMemo(() => {
    return getEffectiveTheme(preferences.theme)
  }, [preferences.theme])

  const value = useMemo(() => ({
    theme: preferences.theme,
    effectiveTheme,
    systemTheme,
    setTheme: preferences.setTheme,
    isHydrated,
  }), [preferences.theme, effectiveTheme, systemTheme, preferences.setTheme, isHydrated])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useTheme hook
 * 
 * Access theme context. Throws if used outside ThemeProvider.
 * 
 * @returns {Object} Theme context with theme, effectiveTheme, systemTheme, setTheme, isHydrated
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export default ThemeProvider

