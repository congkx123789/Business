/**
 * CLDR (Common Locale Data Repository) Utilities
 * 
 * Provides locale-aware formatting for dates, numbers, plurals, and currency.
 * Uses Intl API with CLDR data support.
 */

/**
 * Format date with locale-aware formatting
 */
export function formatDate(date, locale = 'en', options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
}

/**
 * Format time with locale-aware formatting
 */
export function formatTime(date, locale = 'en', options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  const defaultOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: locale === 'en' || locale === 'en-US',
  }
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
}

/**
 * Format number with locale-aware formatting
 */
export function formatNumber(number, locale = 'en', options = {}) {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
  
  return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(number)
}

/**
 * Format currency with locale-aware formatting
 */
export function formatCurrency(amount, locale = 'en', currency = 'USD', options = {}) {
  const currencyMap = {
    'en': 'USD',
    'en-US': 'USD',
    'th': 'THB',
    'th-TH': 'THB',
  }
  
  const currencyCode = currencyMap[locale] || currency
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    ...options,
  }).format(amount)
}

/**
 * Get plural form for a locale
 * Uses ICU MessageFormat plural rules
 */
export function getPluralForm(locale, count) {
  const rules = new Intl.PluralRules(locale)
  return rules.select(count)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date, locale = 'en', options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options })
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (Math.abs(diffInSeconds) < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (Math.abs(diffInSeconds) < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * Get locale-specific currency symbol
 */
export function getCurrencySymbol(locale, currency = 'USD') {
  const currencyMap = {
    'en': 'USD',
    'en-US': 'USD',
    'th': 'THB',
    'th-TH': 'THB',
  }
  
  const currencyCode = currencyMap[locale] || currency
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0).find(part => part.type === 'currency').value
}

export default {
  formatDate,
  formatTime,
  formatNumber,
  formatCurrency,
  getPluralForm,
  formatRelativeTime,
  getCurrencySymbol,
}

