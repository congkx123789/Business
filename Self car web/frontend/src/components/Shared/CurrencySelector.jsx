import { useState, useEffect } from 'react'
import { DollarSign, Check } from 'lucide-react'
import { usePreferencesStore } from '../../store/preferencesStore'
import { useLocale } from '../../hooks/useLocale'
import { CURRENCIES } from '../../types/preferences'
import type { Currency } from '../../types/preferences'

/**
 * CurrencySelector Component
 * 
 * Allows users to select their preferred currency.
 * Uses Intl APIs for proper currency formatting.
 * 
 * @param {string} className - Additional CSS classes
 */
const CurrencySelector = ({ className = '' }) => {
  const { currency, setCurrency } = usePreferencesStore()
  const { locale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  
  // Get available currencies
  const currencies = Object.values(CURRENCIES)
  
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]
  
  const handleCurrencyChange = (currencyCode: Currency) => {
    if (currencyCode === currency) {
      setIsOpen(false)
      return
    }
    
    setIsOpen(false)
    setCurrency(currencyCode)
  }
  
  // Format currency name with native symbol
  const formatCurrencyName = (currencyConfig) => {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    
    // Get symbol from formatter (e.g., "$", "฿")
    const parts = formatter.formatToParts(0)
    const symbol = parts.find(p => p.type === 'currency')?.value || currencyConfig.symbol
    
    return `${symbol} ${currencyConfig.name}`
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
        aria-label="Change currency"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-gray-600 dark:text-dark-text-secondary" />
          <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
            {formatCurrencyName(currentCurrency)}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
          {currentCurrency.code}
        </span>
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
          <div className="relative mt-2 w-full bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-default z-20">
            <div className="py-1">
              {currencies.map((currencyConfig) => (
                <button
                  key={currencyConfig.code}
                  onClick={() => handleCurrencyChange(currencyConfig.code)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm transition-colors ${
                    currency === currencyConfig.code
                      ? 'bg-primary-50 dark:bg-dark-bg-tertiary text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                  }`}
                  aria-pressed={currency === currencyConfig.code}
                >
                  <span className="flex-1 text-left font-medium">
                    {formatCurrencyName(currencyConfig)}
                  </span>
                  {currency === currencyConfig.code && (
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

export default CurrencySelector

