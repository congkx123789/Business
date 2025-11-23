import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { usePreferencesStore } from '../../store/preferencesStore'
import { useTranslation } from 'react-i18next'
import { applyTheme, getEffectiveTheme } from '../../utils/theme'

/**
 * PreferenceContext
 * Provides theme, locale, currency, and other preferences to child components.
 * Handles SSR hydration to prevent flash of wrong theme/locale.
 */
const PreferenceContext = createContext(null)

/**
 * PreferenceProvider
 * 
 * Context provider for user preferences with SSR-safe hydration.
 * Syncs preferences store with i18n and theme system.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.initialPreferences - Optional initial preferences from SSR
 */
export const PreferenceProvider = ({ children, initialPreferences = null }) => {
  const preferences = usePreferencesStore()
  const { i18n } = useTranslation()
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Initialize from SSR preferences if provided
  useEffect(() => {
    if (initialPreferences && !isHydrated) {
      if (initialPreferences.locale) {
        preferences.setLocale(initialPreferences.locale)
        i18n.changeLanguage(initialPreferences.locale)
      }
      if (initialPreferences.theme) {
        preferences.setTheme(initialPreferences.theme)
      }
      if (initialPreferences.currency) {
        preferences.setCurrency(initialPreferences.currency)
      }
      if (initialPreferences.units !== undefined) {
        preferences.setUnits(initialPreferences.units)
      }
      if (initialPreferences.reducedMotion !== undefined) {
        preferences.setReducedMotion(initialPreferences.reducedMotion)
      }
      if (initialPreferences.highContrast !== undefined) {
        preferences.setHighContrast(initialPreferences.highContrast)
      }
      setIsHydrated(true)
    } else {
      setIsHydrated(true)
    }
  }, [initialPreferences, isHydrated, preferences, i18n])
  
  // Sync theme changes
  useEffect(() => {
    if (isHydrated) {
      applyTheme(preferences.theme)
    }
  }, [preferences.theme, isHydrated])
  
  // Sync locale changes with i18n
  useEffect(() => {
    if (isHydrated && preferences.locale && i18n.language !== preferences.locale) {
      i18n.changeLanguage(preferences.locale)
    }
  }, [preferences.locale, i18n, isHydrated])
  
  // Apply reduced motion preference
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (preferences.reducedMotion) {
        root.classList.add('reduce-motion')
      } else {
        root.classList.remove('reduce-motion')
      }
    }
  }, [preferences.reducedMotion])
  
  // Apply high contrast preference
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (preferences.highContrast) {
        root.classList.add('high-contrast')
      } else {
        root.classList.remove('high-contrast')
      }
    }
  }, [preferences.highContrast])
  
  const value = useMemo(() => ({
    ...preferences,
    isHydrated,
    effectiveTheme: getEffectiveTheme(preferences.theme),
  }), [preferences, isHydrated])
  
  return (
    <PreferenceContext.Provider value={value}>
      {children}
    </PreferenceContext.Provider>
  )
}

/**
 * usePreferences hook
 * 
 * Access preferences context. Throws if used outside PreferenceProvider.
 */
export const usePreferences = () => {
  const context = useContext(PreferenceContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferenceProvider')
  }
  return context
}

export default PreferenceProvider

