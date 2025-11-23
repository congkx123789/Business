import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations by namespace
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enCars from './locales/en/cars.json'
import enBooking from './locales/en/booking.json'
import enCheckout from './locales/en/checkout.json'
import enAuth from './locales/en/auth.json'
import enAdmin from './locales/en/admin.json'
import enErrors from './locales/en/errors.json'
import enLoading from './locales/en/loading.json'

import thCommon from './locales/th/common.json'
import thHome from './locales/th/home.json'
import thCars from './locales/th/cars.json'
import thBooking from './locales/th/booking.json'
import thCheckout from './locales/th/checkout.json'
import thAuth from './locales/th/auth.json'
import thAdmin from './locales/th/admin.json'
import thErrors from './locales/th/errors.json'
import thLoading from './locales/th/loading.json'

/**
 * i18n Configuration
 * 
 * Internationalization framework for multi-market support.
 * Supports locale switching, translation loading, and currency formatting.
 * 
 * Namespaces by domain:
 * - common: Shared translations (app name, nav, etc.)
 * - home: Home page translations
 * - cars: Car browsing and filtering
 * - booking: Booking flow
 * - checkout: Payment and checkout
 * - auth: Authentication pages
 * - admin: Admin dashboard
 * - errors: Error messages
 * - loading: Loading states
 */

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n down to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default namespace
    defaultNS: 'common',
    
    // All namespaces
    ns: ['common', 'home', 'cars', 'booking', 'checkout', 'auth', 'admin', 'errors', 'loading'],
    
    // Fallback language (enhanced fallback chain - FE-092)
    fallbackLng: {
      // Try locale variant first, then base language, then English
      'en-US': ['en'],
      'th-TH': ['th', 'en'],
      default: ['en'],
    },
    
    // Supported languages (BCP-47 tags)
    supportedLngs: ['en', 'en-US', 'th', 'th-TH'],
    
    // Resources by namespace
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        cars: enCars,
        booking: enBooking,
        checkout: enCheckout,
        auth: enAuth,
        admin: enAdmin,
        errors: enErrors,
        loading: enLoading,
      },
      'en-US': {
        common: enCommon,
        home: enHome,
        cars: enCars,
        booking: enBooking,
        checkout: enCheckout,
        auth: enAuth,
        admin: enAdmin,
        errors: enErrors,
        loading: enLoading,
      },
      th: {
        common: thCommon,
        home: thHome,
        cars: thCars,
        booking: thBooking,
        checkout: thCheckout,
        auth: thAuth,
        admin: thAdmin,
        errors: thErrors,
        loading: thLoading,
      },
      'th-TH': {
        common: thCommon,
        home: thHome,
        cars: thCars,
        booking: thBooking,
        checkout: thCheckout,
        auth: thAuth,
        admin: thAdmin,
        errors: thErrors,
        loading: thLoading,
      },
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes
      formatSeparator: ',',
      format: (value, format, lng) => {
        // Custom formatting for dates, numbers, etc.
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: lng === 'th' || lng === 'th-TH' ? 'THB' : 'USD',
          }).format(value)
        }
        return value
      },
    },
    
    // Detection options
    detection: {
      // Order of detection: cookie, URL param, localStorage, navigator, htmlTag
      order: ['cookie', 'querystring', 'localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage', 'cookie'],
      
      // Keys for localStorage and cookie
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
      
      // Cookie options
      cookieMinutes: 365 * 24 * 60, // 1 year
      cookieOptions: {
        path: '/',
        sameSite: 'strict',
      },
    },
    
    // React options
    react: {
      useSuspense: false,
    },
    
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
    
    // Missing key handling (FE-092)
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, defaultValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`, defaultValue)
      }
      // Log to backend for tracking missing translations
      if (typeof window !== 'undefined' && window.navigator?.sendBeacon) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
          window.navigator.sendBeacon(
            `${API_BASE_URL}/metrics/missing-translations`,
            JSON.stringify({ lng, ns, key, defaultValue, timestamp: new Date().toISOString() })
          )
        } catch (e) {
          // Silently fail - non-critical
        }
      }
    },
    
    // Fallback handling (FE-092)
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    
    // Parse missing keys for better fallback (FE-092)
    parseMissingKeyHandler: (key) => {
      // Return key with namespace if missing
      return `[${key}]`
    },
  })

/**
 * Hydration Guard for i18n (FE-090)
 * Prevents hydration mismatches by ensuring i18n is ready before rendering
 */
export const waitForI18n = () => {
  return new Promise((resolve) => {
    if (i18n.isInitialized) {
      resolve()
    } else {
      i18n.on('initialized', () => {
        resolve()
      })
    }
  })
}

/**
 * Check if i18n is ready (hydration guard)
 */
export const isI18nReady = () => {
  return i18n.isInitialized && !i18n.isLoading
}

export default i18n

