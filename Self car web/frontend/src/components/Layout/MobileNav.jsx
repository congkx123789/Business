import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Car, Search, MessageCircle, User } from 'lucide-react'
import iconSizes from '../../utils/iconSizes'
import { motion, useMotionValue } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/authStore'
import useMessageStore from '../../store/messageStore'

/**
 * Mobile Bottom Navigation (FE-031)
 * 
 * Bottom dock navigation for mobile with:
 * - Safe thumb zones (56px touch targets - minimum recommended)
 * - Sticky primary actions
 * - Active state indicators
 * - Swipe gestures support
 */
const MobileNav = () => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const { getUnreadCount } = useMessageStore()
  const { t } = useTranslation()
  const unreadCount = getUnreadCount(user?.id)
  const [isVisible, setIsVisible] = useState(true)
  const y = useMotionValue(0)
  
  // Hide/show nav on scroll (optional enhancement)
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateNavVisibility = () => {
      const currentScrollY = window.scrollY
      // Show nav when scrolling up or at top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false)
      }
      lastScrollY = currentScrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavVisibility)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    {
      icon: Home,
      label: t('common:nav.home') || 'Home',
      path: '/',
      ariaLabel: 'Home',
    },
    {
      icon: Car,
      label: t('common:nav.cars') || 'Cars',
      path: '/cars',
      ariaLabel: 'Browse cars',
    },
    {
      icon: Search,
      label: t('common:search.label') || 'Search',
      path: '/cars?search=',
      ariaLabel: 'Search cars',
    },
    {
      icon: MessageCircle,
      label: t('common:nav.messages') || 'Messages',
      path: '/messages',
      ariaLabel: 'Messages',
      badge: unreadCount > 0 ? unreadCount : null,
      requiresAuth: true,
    },
    {
      icon: User,
      label: t('common:nav.profile') || 'Profile',
      path: '/profile',
      ariaLabel: 'Profile',
      requiresAuth: true,
    },
  ]

  const filteredItems = navItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) {
      return false
    }
    return true
  })

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Handle drag gestures for swipe up/down
  const handleDragEnd = (event, info) => {
    const threshold = 50
    if (info.offset.y > threshold) {
      setIsVisible(false)
    } else if (info.offset.y < -threshold) {
      setIsVisible(true)
    }
    y.set(0)
  }

  return (
    <motion.nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-xl border-t border-gray-200 dark:border-dark-border-default shadow-lg safe-area-inset-bottom"
      role="navigation"
      aria-label="Mobile navigation"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ y }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle - Visual indicator for swipe gesture */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-12 h-1 bg-gray-300 dark:bg-dark-border-default rounded-full" />
      </div>
      
      <div className="flex items-center justify-around h-16 px-[2%] pb-safe">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <motion.div
              key={item.path}
              whileTap={{ scale: 0.9 }}
              className="flex-1 flex justify-center"
            >
              <Link
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[15%] min-h-full rounded-xl transition-all duration-200 touch-manipulation ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 dark:text-dark-text-secondary active:text-primary-600 dark:active:text-primary-400 active:bg-gray-100 dark:active:bg-dark-bg-tertiary'
                }`}
                aria-label={item.ariaLabel}
                aria-current={active ? 'page' : undefined}
                style={{ 
                  // Ensure safe thumb zone as percentage of container
                  minHeight: '100%',
                  minWidth: '15%',
                  // Add padding in percentage
                  padding: '2%',
                }}
              >
                <div className="relative">
                  <Icon size={iconSizes.md} />
                  {item.badge && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.125rem] h-[1.125rem] flex items-center justify-center px-1 shadow-lg"
                      aria-label={`${item.badge} unread messages`}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default MobileNav

