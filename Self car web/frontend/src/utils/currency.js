/**
 * Currency Formatting Utilities
 * 
 * Currency formatting layer aligned with backend exchange-rate caching.
 * Supports multiple currencies and exchange rate conversion.
 */

/**
 * Currency configuration per locale
 */
export const CURRENCY_CONFIG = {
  en: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    exchangeRate: 1.0, // Base currency
  },
  th: {
    code: 'THB',
    symbol: '฿',
    locale: 'th-TH',
    exchangeRate: 35.0, // Example: 1 USD = 35 THB (aligned with backend cache)
  },
}

/**
 * Gets currency configuration for current locale
 */
export const getCurrencyConfig = (locale = 'en') => {
  return CURRENCY_CONFIG[locale] || CURRENCY_CONFIG.en
}

/**
 * Formats price with currency
 * Aligned with backend exchange-rate caching
 * 
 * @param {number} price - Price in base currency (USD)
 * @param {string} locale - Locale code (e.g., 'en', 'th')
 * @param {number} exchangeRate - Exchange rate (optional, uses default if not provided)
 * @returns {string} Formatted price with currency
 */
export const formatPrice = (price, locale = 'en', exchangeRate = null) => {
  if (!price || isNaN(price)) {
    return formatPrice(0, locale)
  }
  
  const config = getCurrencyConfig(locale)
  const rate = exchangeRate || config.exchangeRate
  const convertedPrice = price * rate
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(convertedPrice)
}

/**
 * Formats number with locale-specific formatting
 * 
 * @param {number} number - Number to format
 * @param {string} locale - Locale code
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export const formatNumber = (number, locale = 'en', options = {}) => {
  if (!number || isNaN(number)) {
    return formatNumber(0, locale, options)
  }
  
  const config = getCurrencyConfig(locale)
  
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number)
}

/**
 * Formats date with locale-specific formatting
 * 
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale code
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (date, locale = 'en', options = {}) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  const config = getCurrencyConfig(locale)
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  
  return new Intl.DateTimeFormat(config.locale, defaultOptions).format(dateObj)
}

/**
 * Formats time with locale-specific formatting
 * 
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale code
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time
 */
export const formatTime = (date, locale = 'en', options = {}) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  const config = getCurrencyConfig(locale)
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }
  
  return new Intl.DateTimeFormat(config.locale, defaultOptions).format(dateObj)
}

/**
 * Converts price from base currency to target currency
 * Uses exchange rate from backend cache
 * 
 * @param {number} price - Price in base currency (USD)
 * @param {string} targetLocale - Target locale
 * @param {number} exchangeRate - Exchange rate (optional)
 * @returns {number} Converted price
 */
export const convertPrice = (price, targetLocale = 'en', exchangeRate = null) => {
  if (!price || isNaN(price)) {
    return 0
  }
  
  const config = getCurrencyConfig(targetLocale)
  const rate = exchangeRate || config.exchangeRate
  
  return price * rate
}

/**
 * Gets currency symbol for locale
 */
export const getCurrencySymbol = (locale = 'en') => {
  const config = getCurrencyConfig(locale)
  return config.symbol
}

/**
 * Gets currency code for locale
 */
export const getCurrencyCode = (locale = 'en') => {
  const config = getCurrencyConfig(locale)
  return config.code
}

/**
 * Gets exchange rate for locale
 * In production, this would fetch from backend cache
 */
export const getExchangeRate = async (locale = 'en') => {
  const config = getCurrencyConfig(locale)
  
  // In production, fetch from backend exchange rate cache
  // For now, return default rate
  try {
    const response = await fetch(`/api/exchange-rates/${config.code}`)
    if (response.ok) {
      const data = await response.json()
      return data.rate || config.exchangeRate
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate, using default:', error)
  }
  
  return config.exchangeRate
}

export default {
  formatPrice,
  formatNumber,
  formatDate,
  formatTime,
  convertPrice,
  getCurrencySymbol,
  getCurrencyCode,
  getExchangeRate,
  getCurrencyConfig,
  CURRENCY_CONFIG,
}

