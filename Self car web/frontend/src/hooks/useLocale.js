import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { usePreferencesStore } from '../store/preferencesStore'
import { formatPrice, formatNumber, formatDate, formatTime, getExchangeRate } from '../utils/currency'
import * as cldr from '../utils/cldr'

/**
 * Locale Hook
 * 
 * Provides locale management and formatting utilities.
 * Handles locale switching, currency formatting, and exchange rate updates.
 */
export const useLocale = () => {
  const { i18n } = useTranslation()
  const { locale: preferenceLocale, currency, setLocale: setPreferenceLocale, setCurrency } = usePreferencesStore()
  const [locale, setLocale] = useState(i18n.language || preferenceLocale || 'en')
  const [exchangeRate, setExchangeRate] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Sync with preferences store
  useEffect(() => {
    if (preferenceLocale && preferenceLocale !== locale) {
      setLocale(preferenceLocale)
      i18n.changeLanguage(preferenceLocale)
    }
  }, [preferenceLocale, i18n])
  
  // Update locale when i18n changes
  useEffect(() => {
    const currentLocale = i18n.language || 'en'
    setLocale(currentLocale)
    
    // Update preferences if changed
    if (currentLocale !== preferenceLocale) {
      setPreferenceLocale(currentLocale)
      
      // Update currency based on locale
      const currencyMap = {
        'en': 'USD',
        'en-US': 'USD',
        'th': 'THB',
        'th-TH': 'THB',
      }
      const newCurrency = currencyMap[currentLocale] || 'USD'
      if (newCurrency !== currency) {
        setCurrency(newCurrency)
      }
    }
  }, [i18n.language, preferenceLocale, setPreferenceLocale, setCurrency, currency])
  
  // Fetch exchange rate when locale changes
  useEffect(() => {
    const fetchRate = async () => {
      if (locale !== 'en') {
        setLoading(true)
        try {
          const rate = await getExchangeRate(locale)
          setExchangeRate(rate)
        } catch (error) {
          console.error('Failed to fetch exchange rate:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setExchangeRate(1.0) // Base currency
      }
    }
    
    fetchRate()
  }, [locale])
  
  // Change locale
  const changeLocale = useCallback(async (newLocale) => {
    setLoading(true)
    try {
      await i18n.changeLanguage(newLocale)
      setLocale(newLocale)
    } catch (error) {
      console.error('Failed to change locale:', error)
    } finally {
      setLoading(false)
    }
  }, [i18n])
  
  // Format price with current locale and exchange rate (using CLDR)
  const formatPriceWithLocale = useCallback((price, options = {}) => {
    return cldr.formatCurrency(price, locale, currency, options)
  }, [locale, currency])
  
  // Format number with current locale (using CLDR)
  const formatNumberWithLocale = useCallback((number, options = {}) => {
    return cldr.formatNumber(number, locale, options)
  }, [locale])
  
  // Format date with current locale (using CLDR)
  const formatDateWithLocale = useCallback((date, options = {}) => {
    return cldr.formatDate(date, locale, options)
  }, [locale])
  
  // Format time with current locale (using CLDR)
  const formatTimeWithLocale = useCallback((date, options = {}) => {
    return cldr.formatTime(date, locale, options)
  }, [locale])
  
  // Format relative time (using CLDR)
  const formatRelativeTimeWithLocale = useCallback((date, options = {}) => {
    return cldr.formatRelativeTime(date, locale, options)
  }, [locale])
  
  // Get plural form (using CLDR)
  const getPluralForm = useCallback((count) => {
    return cldr.getPluralForm(locale, count)
  }, [locale])
  
  return {
    locale,
    currency,
    changeLocale,
    loading,
    exchangeRate,
    formatPrice: formatPriceWithLocale,
    formatNumber: formatNumberWithLocale,
    formatDate: formatDateWithLocale,
    formatTime: formatTimeWithLocale,
    formatRelativeTime: formatRelativeTimeWithLocale,
    getPluralForm,
  }
}

export default useLocale

