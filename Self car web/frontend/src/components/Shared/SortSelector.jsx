import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown, Check } from 'lucide-react'

/**
 * SortSelector Component
 * 
 * Allows users to sort results by different criteria.
 * Localized and theme-aware.
 * 
 * @param {string} value - Current sort value
 * @param {Function} onChange - Callback when sort changes
 * @param {string} className - Additional CSS classes
 */
const SortSelector = ({ value, onChange, className = '' }) => {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  
  const sortOptions = [
    { value: 'featured', label: t('sort.featured') },
    { value: 'priceLow', label: t('sort.priceLow') },
    { value: 'priceHigh', label: t('sort.priceHigh') },
    { value: 'nameAsc', label: t('sort.nameAsc') },
    { value: 'nameDesc', label: t('sort.nameDesc') },
    { value: 'newest', label: t('sort.newest') },
    { value: 'oldest', label: t('sort.oldest') },
  ]
  
  const currentSort = sortOptions.find(opt => opt.value === value) || sortOptions[0]
  
  const handleSortChange = (sortValue) => {
    onChange(sortValue)
    setIsOpen(false)
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        aria-label={t('sort.title')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ArrowUpDown size={16} className="text-gray-600 dark:text-dark-text-secondary" />
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
          {currentSort.label}
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
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-default z-20">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm transition-colors ${
                    value === option.value
                      ? 'bg-primary-50 dark:bg-dark-bg-tertiary text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                  }`}
                  aria-pressed={value === option.value}
                >
                  <span className="flex-1 text-left">{option.label}</span>
                  {value === option.value && (
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

export default SortSelector

