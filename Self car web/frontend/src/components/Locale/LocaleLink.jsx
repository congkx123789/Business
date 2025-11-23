import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../../types/preferences'

/**
 * LocaleLink Component
 * 
 * A Link component that preserves the current locale in the URL.
 * Automatically adds or updates the locale parameter in the URL.
 * 
 * Usage:
 * <LocaleLink to="/cars">Cars</LocaleLink>
 * <LocaleLink to="/cars" locale="th-TH">รถยนต์</LocaleLink>
 */
const LocaleLink = ({ 
  to, 
  locale: propLocale, 
  children, 
  className = '',
  ...props 
}) => {
  const { i18n } = useTranslation()
  const location = useLocation()
  
  // Use prop locale or current locale
  const locale = propLocale || i18n.language
  
  // Normalize locale (e.g., 'en-US' -> 'en', 'th-TH' -> 'th')
  const normalizedLocale = locale.split('-')[0]
  
  // Build URL with locale
  const buildLocaleUrl = (path) => {
    // If path already has locale prefix, replace it
    const localePattern = /^\/(en|th|en-US|th-TH)(\/|$)/
    const cleanedPath = path.replace(localePattern, '/')
    
    // Add locale prefix if not default (en)
    if (normalizedLocale !== 'en') {
      return `/${locale}${cleanedPath === '/' ? '' : cleanedPath}`
    }
    
    return cleanedPath
  }
  
  // Handle query string and hash
  const [path, queryAndHash] = to.split('?')
  const [query, hash] = queryAndHash ? queryAndHash.split('#') : [null, null]
  
  let finalUrl = buildLocaleUrl(path)
  
  if (query) {
    finalUrl += `?${query}`
  }
  
  if (hash) {
    finalUrl += `#${hash}`
  }
  
  return (
    <Link 
      to={finalUrl}
      className={className}
      {...props}
    >
      {children}
    </Link>
  )
}

export default LocaleLink

