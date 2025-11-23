import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { Globe, Check } from 'lucide-react'
import { useLocale } from '../../hooks/useLocale'
import { usePreferencesStore } from '../../store/preferencesStore'
import { SUPPORTED_LOCALES } from '../../types/preferences'

/**
 * LanguageSwitcher Component
 * 
 * Allows users to switch between supported locales.
 * Uses native names (no flags) as per industry best practices.
 * Supports header and settings placement.
 * 
 * @param {string} placement - 'header' | 'settings' (default: 'header')
 * @param {string} className - Additional CSS classes
 */
const LanguageSwitcher = ({ placement = 'header', className = '' }) => {
  const { i18n } = useTranslation()
  const { locale, changeLocale, loading } = useLocale()
  const { setLocale: setPreferenceLocale, locale: preferenceLocale } = usePreferencesStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  
  // Sync i18n with preferences
  useEffect(() => {
    if (preferenceLocale && i18n.language !== preferenceLocale) {
      i18n.changeLanguage(preferenceLocale)
    }
  }, [preferenceLocale, i18n])
  
  // Get supported locales from config (use native names, no flags)
  const locales = Object.values(SUPPORTED_LOCALES)
    .filter(loc => loc.code === 'en' || loc.code === 'th') // Show only primary locales
    .map(loc => ({
      code: loc.code,
      nativeName: loc.nativeName,
    }))
  
  const currentLocale = locales.find(l => l.code === locale) || locales.find(l => l.code === 'en')
  
  const handleLocaleChange = async (localeCode) => {
    if (localeCode === locale) {
      setIsOpen(false)
      return
    }
    
    setIsOpen(false)
    
    // Update i18n
    await changeLocale(localeCode)
    
    // Update preferences store
    setPreferenceLocale(localeCode)
    
    // Update URL with locale (preserve current route)
    const normalizedLocale = localeCode.split('-')[0]
    const currentPath = location.pathname
    
    // Remove existing locale from path
    const pathWithoutLocale = currentPath.replace(/^\/(en|th|en-US|th-TH)/, '')
    
    // Build new path with locale
    let newPath = pathWithoutLocale || '/'
    if (normalizedLocale !== 'en') {
      newPath = `/${localeCode}${newPath === '/' ? '' : newPath}`
    }
    
    // Preserve query string and hash
    const newUrl = newPath + location.search + location.hash
    
    // Navigate to new URL (this triggers route change)
    navigate(newUrl, { replace: true })
  }
  
  // Handle keyboard navigation (FE-091)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault()
      setIsOpen(true)
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault()
      const firstOption = e.currentTarget.nextElementSibling?.querySelector('button')
      if (firstOption) firstOption.focus()
    }
  }

  // Handle keyboard navigation in dropdown
  const handleDropdownKeyDown = (e, index) => {
    const options = locales.map((_, i) => 
      document.querySelector(`[data-locale-option="${i}"]`)
    ).filter(Boolean)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = (index + 1) % options.length
        options[nextIndex]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = (index - 1 + options.length) % options.length
        options[prevIndex]?.focus()
        break
      case 'Home':
        e.preventDefault()
        options[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        options[options.length - 1]?.focus()
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        // Return focus to button
        setTimeout(() => {
          const button = document.querySelector(`[data-locale-switcher-button]`)
          button?.focus()
        }, 0)
        break
    }
  }

  // Close on escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])
  
  // Styles based on placement
  const buttonStyles = placement === 'settings' 
    ? "w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
    : "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
  
  const dropdownStyles = placement === 'settings'
    ? "relative mt-2 w-full"
    : "absolute right-0 mt-2 w-48"
  
  return (
    <div className={`relative ${className}`}>
      <button
        data-locale-switcher-button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`${buttonStyles} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2`}
        aria-label={`Change language, current: ${currentLocale?.nativeName || 'English'}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="locale-options-list"
        disabled={loading}
        type="button"
      >
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-gray-600 dark:text-dark-text-secondary" />
          <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
            {currentLocale?.nativeName || 'English'}
          </span>
        </div>
        {placement === 'settings' && (
          <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
            {currentLocale?.code.toUpperCase()}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div 
            id="locale-options-list"
            role="listbox"
            aria-label="Language options"
            className={`${dropdownStyles} bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-default z-20`}
          >
            <div className="py-1">
              {locales.map((loc, index) => (
                <button
                  key={loc.code}
                  data-locale-option={index}
                  onClick={() => handleLocaleChange(loc.code)}
                  onKeyDown={(e) => handleDropdownKeyDown(e, index)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset ${
                    locale === loc.code 
                      ? 'bg-primary-50 dark:bg-dark-bg-tertiary text-primary-700 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                  }`}
                  disabled={loading}
                  role="option"
                  aria-selected={locale === loc.code}
                  aria-label={`Switch to ${loc.nativeName}`}
                  tabIndex={index === 0 ? 0 : -1}
                >
                  <span className="flex-1 text-left font-medium">{loc.nativeName}</span>
                  {locale === loc.code && (
                    <Check size={16} className="text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher

