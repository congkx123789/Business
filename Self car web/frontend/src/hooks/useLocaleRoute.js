import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from './useLocale'

/**
 * useLocaleRoute Hook
 * 
 * Provides locale-aware routing utilities.
 * Automatically handles locale prefixes in URLs.
 * 
 * @returns {Object} Route utilities
 */
export const useLocaleRoute = () => {
  const { i18n } = useTranslation()
  const { locale } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  
  /**
   * Builds a locale-aware URL
   * 
   * @param {string} path - Path without locale prefix
   * @param {string} targetLocale - Optional target locale (defaults to current)
   * @returns {string} Locale-aware URL
   */
  const buildLocaleUrl = useMemo(() => {
    return (path, targetLocale = null) => {
      const target = targetLocale || locale
      const normalizedLocale = target.split('-')[0]
      
      // Remove existing locale prefix
      const cleanedPath = path.replace(/^\/(en|th|en-US|th-TH)(\/|$)/, '/')
      
      // Add locale prefix if not default (en)
      if (normalizedLocale !== 'en') {
        return `/${target}${cleanedPath === '/' ? '' : cleanedPath}`
      }
      
      return cleanedPath
    }
  }, [locale])
  
  /**
   * Navigates to a locale-aware route
   * 
   * @param {string} path - Path without locale prefix
   * @param {Object} options - Navigation options
   */
  const navigateToLocale = useMemo(() => {
    return (path, options = {}) => {
      const url = buildLocaleUrl(path)
      navigate(url, options)
    }
  }, [buildLocaleUrl, navigate])
  
  /**
   * Gets current path without locale prefix
   * 
   * @returns {string} Path without locale
   */
  const currentPathWithoutLocale = useMemo(() => {
    return location.pathname.replace(/^\/(en|th|en-US|th-TH)(\/|$)/, '/') || '/'
  }, [location.pathname])
  
  /**
   * Gets current locale from URL or preferences
   * 
   * @returns {string} Current locale
   */
  const currentLocaleFromUrl = useMemo(() => {
    const match = location.pathname.match(/^\/(en|th|en-US|th-TH)(\/|$)/)
    return match ? match[1] : locale
  }, [location.pathname, locale])
  
  return {
    buildLocaleUrl,
    navigateToLocale,
    currentPathWithoutLocale,
    currentLocaleFromUrl,
    locale,
  }
}

export default useLocaleRoute

