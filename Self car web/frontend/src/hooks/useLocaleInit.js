/**
 * Locale Initialization Hook
 * 
 * Initializes locale from multiple sources:
 * 1. SSR-injected locale from Accept-Language header (via meta tag)
 * 2. URL parameter (?locale=th-TH)
 * 3. Cookie (i18nextLng)
 * 4. localStorage (preferences)
 * 5. Backend API detect-locale endpoint (Accept-Language header)
 * 6. Browser navigator (fallback)
 * 7. Default (en)
 * 
 * Ensures locale persists across route changes and page refreshes.
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { usePreferencesStore } from '../store/preferencesStore'
import axios from 'axios'

/**
 * Get SSR-injected locale from meta tag (injected by backend/HTML)
 */
const getSSRLocale = () => {
  if (typeof document === 'undefined') return null
  const metaTag = document.querySelector('meta[name="detected-locale"]')
  return metaTag?.getAttribute('content') || null
}

/**
 * Detect locale from backend API using Accept-Language header
 */
const detectLocaleFromBackend = async () => {
  try {
    const response = await axios.get('/api/i18n/detect-locale', {
      withCredentials: true,
    })
    return response.data?.locale || null
  } catch (error) {
    console.warn('Failed to detect locale from backend:', error)
    return null
  }
}

export const useLocaleInit = () => {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const { locale: preferenceLocale, setLocale: setPreferenceLocale } = usePreferencesStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    const initializeLocale = async () => {
      // Priority 1: URL parameter (highest priority - user explicitly chose)
      const urlLocale = searchParams.get('locale')
      if (urlLocale && i18n.languages.includes(urlLocale)) {
        i18n.changeLanguage(urlLocale)
        setPreferenceLocale(urlLocale)
        setIsInitialized(true)
        return
      }
      
      // Priority 2: Preferences store (from localStorage - user's previous choice)
      if (preferenceLocale && i18n.languages.includes(preferenceLocale)) {
        if (i18n.language !== preferenceLocale) {
          i18n.changeLanguage(preferenceLocale)
        }
        setIsInitialized(true)
        return
      }
      
      // Priority 3: SSR-injected locale (from Accept-Language header on initial page load)
      const ssrLocale = getSSRLocale()
      if (ssrLocale && i18n.languages.includes(ssrLocale)) {
        i18n.changeLanguage(ssrLocale)
        setPreferenceLocale(ssrLocale)
        setIsInitialized(true)
        return
      }
      
      // Priority 4: Cookie (i18nextLng) - handled by i18next-browser-languagedetector
      // Check if already detected by i18next
      const detectedByI18n = i18n.language
      if (detectedByI18n && i18n.languages.includes(detectedByI18n)) {
        setPreferenceLocale(detectedByI18n)
        setIsInitialized(true)
        return
      }
      
      // Priority 5: Backend API detect-locale (for subsequent requests)
      try {
        const backendLocale = await detectLocaleFromBackend()
        if (backendLocale && i18n.languages.includes(backendLocale)) {
          i18n.changeLanguage(backendLocale)
          setPreferenceLocale(backendLocale)
          setIsInitialized(true)
          return
        }
      } catch (error) {
        console.warn('Locale detection from backend failed, using fallback')
      }
      
      // Priority 6: Default (fallback to 'en')
      if (!i18n.language || !i18n.languages.includes(i18n.language)) {
        i18n.changeLanguage('en')
        setPreferenceLocale('en')
      }
      
      setIsInitialized(true)
    }
    
    initializeLocale()
  }, []) // Run only once on mount
  
  // Sync i18n changes with preferences store
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      if (lng !== preferenceLocale) {
        setPreferenceLocale(lng)
      }
    }
    
    i18n.on('languageChanged', handleLanguageChange)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n, preferenceLocale, setPreferenceLocale])
}

export default useLocaleInit

