import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, LogOut, LayoutDashboard, MessageCircle, Home, Car, Bell, Settings, Clock, TrendingUp } from 'lucide-react'
import iconSizes from '../../utils/iconSizes'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/authStore'
import useMessageStore from '../../store/messageStore'
import useSavedSearchStore from '../../store/savedSearchStore'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefetchCars } from '../../hooks/usePrefetch'
import LocaleSwitcher from '../Locale/LocaleSwitcher'
import ThemeToggle from '../Theme/ThemeToggle'
import { Input } from '../Foundation'
import { Button } from '../Foundation'

/**
 * Header Component (FE-030)
 * 
 * Responsive header with:
 * - Brand logo
 * - Global search
 * - Language/theme controls
 * - Account menu
 * - Mobile-friendly navigation
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const { isAuthenticated, user, logout } = useAuthStore()
  const { getUnreadCount } = useMessageStore()
  const { getAllSearches } = useSavedSearchStore()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = getUnreadCount(user?.id)
  const { prefetchCars } = usePrefetchCars()
  const { t } = useTranslation()
  const accountMenuRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)

  const isAdmin = user?.role === 'ADMIN'

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen])

  // Update search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const searchParam = params.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [location.search])

  // Generate search suggestions based on query
  useEffect(() => {
    if (searchQuery.trim().length > 0 && isSearchFocused) {
      const savedSearches = getAllSearches()
      const popularBrands = ['Toyota', 'Honda', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW']
      const suggestions = []
      
      // Add matching brands
      popularBrands.forEach(brand => {
        if (brand.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push({
            type: 'brand',
            label: brand,
            value: brand,
            icon: Car,
          })
        }
      })
      
      // Add matching saved searches
      savedSearches.slice(0, 3).forEach(search => {
        const searchText = Object.values(search.params).join(' ').toLowerCase()
        if (searchText.includes(searchQuery.toLowerCase())) {
          suggestions.push({
            type: 'saved',
            label: search.name,
            value: search.params,
            icon: Clock,
          })
        }
      })
      
      // Add quick search suggestions
      if (searchQuery.length >= 2) {
        suggestions.push({
          type: 'quick',
          label: `Search for "${searchQuery}"`,
          value: searchQuery,
          icon: Search,
        })
      }
      
      setSearchSuggestions(suggestions.slice(0, 5))
    } else {
      setSearchSuggestions([])
    }
  }, [searchQuery, isSearchFocused, getAllSearches])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false)
      }
    }

    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchFocused])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    }
    navigate(`/cars?${params.toString()}`)
    setIsSearchFocused(false)
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'saved') {
      // Navigate with saved search params
      const params = new URLSearchParams(suggestion.value)
      navigate(`/cars?${params.toString()}`)
    } else if (suggestion.type === 'brand') {
      // Navigate to brand filter
      navigate(`/cars?brand=${encodeURIComponent(suggestion.value)}`)
    } else {
      // Regular search
      setSearchQuery(suggestion.value)
      const params = new URLSearchParams()
      params.set('search', suggestion.value)
      navigate(`/cars?${params.toString()}`)
    }
    setIsSearchFocused(false)
    setSearchQuery('')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsAccountMenuOpen(false)
  }

  return (
    <header 
      id="main-header" 
      className="bg-white/98 dark:bg-dark-bg-secondary/98 backdrop-blur-2xl shadow-lg dark:shadow-2xl sticky top-0 z-sticky border-b border-gray-200/60 dark:border-dark-border-default/60 transition-all duration-300 ease-out"
      role="banner"
      aria-label={t('common:nav.main') || 'Main navigation'}
    >
      <div className="w-full px-[4%] sm:px-[5%] lg:px-[6%]">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group" aria-label="SelfCar Home">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300"
            >
              <span className="text-white font-bold text-lg md:text-xl z-10">S</span>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </motion.div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:via-purple-500 group-hover:to-pink-400 transition-all duration-300">
              SelfCar
            </span>
          </Link>

          {/* Global Search - Desktop (FE-030: Search-first approach) */}
          <div className="hidden md:flex flex-none w-72 md:w-96 lg:w-[28rem] mx-8" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={t('common:search.placeholder') || 'Search by brand, model, or location...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="pr-12"
                aria-label={t('common:search.label') || 'Search cars'}
                aria-autocomplete="list"
                aria-expanded={isSearchFocused && searchSuggestions.length > 0}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label={t('common:search.submit') || 'Submit search'}
              >
                <Search size={iconSizes.sm} />
              </button>
              
              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-dark-bg-secondary/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/60 dark:border-dark-border-default/60 z-50 max-h-80 overflow-y-auto"
                    role="listbox"
                  >
                    <div className="py-2">
                      {searchSuggestions.map((suggestion, index) => {
                        const Icon = suggestion.icon
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-dark-bg-tertiary dark:hover:to-dark-bg-secondary transition-all rounded-lg mx-2"
                            role="option"
                          >
                            <Icon size={18} className="text-gray-400 dark:text-dark-text-tertiary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                                {suggestion.label}
                              </p>
                              {suggestion.type === 'saved' && (
                                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-0.5">
                                  {t('common:search.savedSearch') || 'Saved search'}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-end flex-wrap gap-x-4 gap-y-2 min-w-0">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary shrink-0"
            >
              <Home size={18} />
              <span>{t('common:nav.home')}</span>
            </Link>
            <Link 
              to="/cars" 
              className="text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary shrink-0"
              onMouseEnter={() => prefetchCars()}
            >
              <Car size={18} />
              <span>{t('common:nav.cars')}</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Messages Icon with Badge */}
                <Link 
                  to="/messages" 
                  className="relative flex items-center justify-center w-10 h-10 text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                  title="Messages"
                  aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <MessageCircle size={20} />
                    {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center px-1 shadow-lg"
                      aria-label={`${unreadCount} unread messages`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Link>
                
                {/* Admin Dashboard */}
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center space-x-1 text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-bg-tertiary"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden lg:inline">{t('common:nav.dashboard')}</span>
                  </Link>
                )}
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Locale Switcher */}
                <LocaleSwitcher />
                
                {/* Account Menu */}
                <div className="relative shrink-0" ref={accountMenuRef}>
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                    aria-label="Account menu"
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline">{user?.firstName || t('common:nav.profile')}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl border border-gray-200 dark:border-dark-border-default z-50"
                      >
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                          >
                            <User size={18} />
                            <span>{t('common:nav.profile')}</span>
                          </Link>
                          <Link
                            to="/messages"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                          >
                            <MessageCircle size={18} />
                            <span>{t('common:nav.messages')}</span>
                            {unreadCount > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                          >
                            <Settings size={18} />
                            <span>{t('common:nav.settings') || 'Settings'}</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                            >
                              <LayoutDashboard size={18} />
                              <span>{t('common:nav.dashboard')}</span>
                            </Link>
                          )}
                          <div className="border-t border-gray-200 dark:border-dark-border-default my-2"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                          >
                            <LogOut size={18} />
                            <span>{t('common:nav.logout')}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <LocaleSwitcher />
                <Link 
                  to="/login" 
                  className="text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                >
                  {t('common:nav.login')}
                </Link>
                <Button variant="primary" size="md" as={Link} to="/register">
                  {t('common:nav.register')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={iconSizes.md} /> : <Menu size={iconSizes.md} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-[4%] pb-[4%]">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder={t('common:search.placeholder') || 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
            aria-label={t('common:search.submit') || 'Submit search'}
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-bg-secondary"
          >
            <div className="px-4 py-4 space-y-2">
              <Link 
                to="/" 
                className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>{t('common:nav.home')}</span>
              </Link>
              <Link 
                to="/cars" 
                className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={() => prefetchCars()}
              >
                <Car size={18} />
                <span>{t('common:nav.cars')}</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/messages" 
                    className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageCircle size={18} />
                    <span>{t('common:nav.messages')}</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin/dashboard" 
                      className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      <span>{t('common:nav.dashboard')}</span>
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>{t('common:nav.profile')}</span>
                  </Link>
                  <div className="flex items-center gap-2 py-2">
                    <ThemeToggle />
                    <LocaleSwitcher />
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 transition-colors font-medium py-2 flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>{t('common:nav.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <ThemeToggle />
                    <LocaleSwitcher />
                  </div>
                  <Link 
                    to="/login" 
                    className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('common:nav.login')}
                  </Link>
                  <Button 
                    variant="primary" 
                    size="md" 
                    as={Link} 
                    to="/register"
                    className="w-full justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('common:nav.register')}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header

