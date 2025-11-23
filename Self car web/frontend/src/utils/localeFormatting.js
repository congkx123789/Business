/**
 * Locale-Aware Formatting Utilities (FE-090)
 * 
 * Provides locale-aware formatting for:
 * - Numbers
 * - Dates
 * - Currency
 * - RTL readiness
 */

import i18n from '../i18n/config'
import { usePreferencesStore } from '../store/preferencesStore'

/**
 * Format number based on locale
 */
export const formatNumber = (value, options = {}) => {
  const locale = i18n.language || 'en'
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }
  
  return new Intl.NumberFormat(locale, defaultOptions).format(value)
}

/**
 * Format currency based on locale and preferences
 */
export const formatCurrency = (value, currency = null) => {
  const locale = i18n.language || 'en'
  const preferences = usePreferencesStore.getState()
  const currencyCode = currency || preferences.currency || (locale.startsWith('th') ? 'THB' : 'USD')
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format date based on locale
 */
export const formatDate = (date, options = {}) => {
  const locale = i18n.language || 'en'
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
}

/**
 * Format date and time
 */
export const formatDateTime = (date, options = {}) => {
  const locale = i18n.language || 'en'
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const locale = i18n.language || 'en'
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((dateObj - now) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds)
    if (interval >= 1) {
      return rtf.format(diffInSeconds < 0 ? -interval : interval, unit)
    }
  }
  
  return rtf.format(0, 'second')
}

/**
 * Get text direction based on locale (RTL readiness)
 */
export const getTextDirection = (locale = null) => {
  const currentLocale = locale || i18n.language || 'en'
  // RTL languages (expand as needed)
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']
  const baseLocale = currentLocale.split('-')[0]
  return rtlLanguages.includes(baseLocale) ? 'rtl' : 'ltr'
}

/**
 * Check if current locale is RTL
 */
export const isRTL = (locale = null) => {
  return getTextDirection(locale) === 'rtl'
}

/**
 * Format distance based on locale and preferences
 */
export const formatDistance = (valueInKm, options = {}) => {
  const preferences = usePreferencesStore.getState()
  const locale = i18n.language || 'en'
  const useMetric = preferences.units === 'metric' || (!preferences.units && !locale.startsWith('en'))
  
  if (useMetric) {
    return `${formatNumber(valueInKm, { maximumFractionDigits: 1 })} km`
  } else {
    const miles = valueInKm * 0.621371
    return `${formatNumber(miles, { maximumFractionDigits: 1 })} mi`
  }
}

/**
 * Format weight based on locale and preferences
 */
export const formatWeight = (valueInKg, options = {}) => {
  const preferences = usePreferencesStore.getState()
  const locale = i18n.language || 'en'
  const useMetric = preferences.units === 'metric' || (!preferences.units && !locale.startsWith('en'))
  
  if (useMetric) {
    return `${formatNumber(valueInKg, { maximumFractionDigits: 1 })} kg`
  } else {
    const pounds = valueInKg * 2.20462
    return `${formatNumber(pounds, { maximumFractionDigits: 1 })} lbs`
  }
}

export default {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getTextDirection,
  isRTL,
  formatDistance,
  formatWeight,
}

