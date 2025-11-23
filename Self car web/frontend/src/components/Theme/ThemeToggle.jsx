import { useState, useEffect, useMemo, useCallback } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { usePreferencesStore } from '../../store/preferencesStore'
import { applyTheme, getSystemTheme, subscribeToSystemTheme } from '../../utils/theme'
import useAuthStore from '../../store/authStore'

/**
 * ThemeToggle Component
 * 
 * Three-state theme toggle: System / Light / Dark
 * Persists to account if logged-in, otherwise localStorage.
 * SSR-safe implementation prevents flash of wrong theme.
 * Performance optimized with memoization and reduced re-renders.
 */
const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = usePreferencesStore()
  const { isAuthenticated, user } = useAuthStore()
  const [systemTheme, setSystemTheme] = useState(getSystemTheme())
  const [isOpen, setIsOpen] = useState(false)
  
  // Memoize theme options to prevent recreation on every render
  const themes = useMemo(() => [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ], [])
  
  // Memoize current theme info
  const currentTheme = useMemo(
    () => themes.find(t => t.value === theme) || themes[0],
    [theme, themes]
  )
  const CurrentIcon = currentTheme.icon
  
  // Subscribe to system theme changes (only when theme is 'system')
  useEffect(() => {
    if (theme !== 'system') return
    
    const unsubscribe = subscribeToSystemTheme((newSystemTheme) => {
      setSystemTheme(newSystemTheme)
      applyTheme('system')
    })
    
    return unsubscribe
  }, [theme])
  
  /**
   * Persist theme preference to user account
   */
  const persistThemeToAccount = useCallback(async (themeValue) => {
    // Only persist if user is authenticated
    if (!isAuthenticated || !user) return
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage) return
      
      const authData = JSON.parse(authStorage)
      const token = authData?.state?.token
      
      if (!token) return
      
      // Update preferences via API
      const response = await fetch(`${API_BASE_URL}/users/me/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: themeValue }),
      })
      
      if (!response.ok) {
        console.warn('Failed to persist theme to account:', response.statusText)
      }
    } catch (error) {
      // Silently fail - localStorage fallback is sufficient
      console.debug('Theme persistence to account failed (using localStorage fallback):', error)
    }
  }, [isAuthenticated, user])
  
  // Apply theme when it changes (optimized to only run when theme actually changes)
  useEffect(() => {
    applyTheme(theme)
    
    // Persist to account if user is logged in
    persistThemeToAccount(theme)
  }, [theme, persistThemeToAccount])
  
  // Memoize handlers to prevent recreation
  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme)
    setIsOpen(false)
  }, [setTheme])
  
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }, [isOpen])
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2"
        aria-label={`Toggle theme, current: ${currentTheme.label}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CurrentIcon size={18} className="text-gray-600 dark:text-dark-text-secondary" />
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary hidden sm:inline">
          {currentTheme.label}
          {theme === 'system' && (
            <span className="ml-1 text-xs text-gray-500 dark:text-dark-text-tertiary">
              ({systemTheme})
            </span>
          )}
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
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-default z-20">
            <div className="py-1">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                const isActive = theme === themeOption.value
                
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleThemeChange(themeOption.value)
                      } else if (e.key === 'Escape') {
                        setIsOpen(false)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset ${
                      isActive
                        ? 'bg-primary-50 dark:bg-dark-bg-tertiary text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${themeOption.label} theme`}
                  >
                    <Icon size={16} />
                    <span className="flex-1 text-left font-medium">{themeOption.label}</span>
                    {isActive && (
                      <span className="text-primary-600 dark:text-primary-400">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeToggle

