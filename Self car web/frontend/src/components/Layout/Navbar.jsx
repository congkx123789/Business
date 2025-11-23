import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, LayoutDashboard, MessageCircle, Home, Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/authStore'
import useMessageStore from '../../store/messageStore'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefetchCars } from '../../hooks/usePrefetch'
import LocaleSwitcher from '../Locale/LocaleSwitcher'
import ThemeToggle from '../Theme/ThemeToggle'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { getUnreadCount } = useMessageStore()
  const navigate = useNavigate()
  const unreadCount = getUnreadCount(user?.id)
  const { prefetchCars } = usePrefetchCars()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <nav id="main-navigation" className="bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur-xl shadow-lg dark:shadow-2xl sticky top-0 z-50 border-b border-gray-200/50 dark:border-dark-border-default/50" role="navigation" aria-label={t('common:nav.main') || 'Main navigation'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Enhanced with modern styling */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300"
            >
              <span className="text-white font-bold text-xl z-10">S</span>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:via-purple-500 group-hover:to-pink-400 transition-all duration-300">
              SelfCar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center gap-1"
            >
              <Home size={18} />
              <span>{t('common:nav.home')}</span>
            </Link>
            <Link 
              to="/cars" 
              className="text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center gap-1"
              onMouseEnter={() => prefetchCars()}
            >
              <Car size={18} />
              <span>{t('common:nav.cars')}</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200 dark:border-dark-border-default">
                {/* Messages Icon with Badge */}
                <Link 
                  to="/messages" 
                  className="relative flex items-center justify-center w-10 h-10 text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                  title="Messages"
                >
                  <MessageCircle size={20} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center px-1 shadow-lg"
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
                    <span>{t('common:nav.dashboard')}</span>
                  </Link>
                )}
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Locale Switcher */}
                <LocaleSwitcher />
                
                {/* Profile */}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-bg-tertiary"
                >
                  <User size={18} />
                  <span>{user?.firstName || t('common:nav.profile')}</span>
                  {user?.role && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                      isAdmin 
                        ? 'bg-primary-50 text-primary-700 border-primary-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {isAdmin ? 'Admin' : 'User'}
                    </span>
                  )}
                </Link>
                
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>{t('common:nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200 dark:border-dark-border-default">
                <ThemeToggle />
                <LocaleSwitcher />
                <Link 
                  to="/login" 
                  className="text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                >
                  {t('common:nav.login')}
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary shadow-md hover:shadow-lg transition-all"
                >
                  {t('common:nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
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
                onClick={() => setIsOpen(false)}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link 
                to="/cars" 
                className="block text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => prefetchCars()}
              >
                <Car size={18} />
                <span>Cars</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/messages" 
                    className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageCircle size={18} />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center px-1 ml-auto">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin/dashboard" 
                      className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 transition-colors font-medium py-2 flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block btn-primary text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
