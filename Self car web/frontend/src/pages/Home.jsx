import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Shield, Clock, DollarSign, ArrowRight, Car, MapPin, Star, TrendingUp, Users, MessageCircle, Lock, CheckCircle, FileText, Newspaper, CreditCard, AlertCircle, XCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePrefetchFeaturedCars } from '../hooks/usePrefetch'
import { useMarket } from '../hooks/useMarket'
import { CarType } from '../types/api'
import { getExperimentValue, AB_EXPERIMENTS, trackExperimentView } from '../utils/abTesting'
import { useReducedMotion } from '../hooks/useMotion'

/**
 * Home Page v1 - Phase 4 Requirements
 * 
 * Hero = search box (tabs for "Mua xe / Bán xe")
 * Browse by Brand/Body Type
 * Trust strip (clear guarantees, transparent pricing, secure chat/lead)
 * Guides/News section
 */
const Home = () => {
  const { prefetchFeaturedCars } = usePrefetchFeaturedCars()
  const { t } = useTranslation()
  const { getContentSlot, isFeatureEnabled } = useMarket()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTab, setSearchTab] = useState('buy') // 'buy' (Mua xe) or 'sell' (Bán xe)
  const prefersReducedMotion = useReducedMotion()

  const motionProps = (props = {}) => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: props.initial?.opacity ?? 0 },
        animate: { opacity: props.animate?.opacity ?? 1 },
        exit: { opacity: props.exit?.opacity ?? 0 },
        transition: { duration: 0 },
        ...props,
        whileHover: undefined,
        whileTap: undefined,
        whileInView: undefined,
      }
    }
    return props
  }

  // AB Test: Trust block position
  const trustBlockPosition = getExperimentValue(AB_EXPERIMENTS.TRUST_BLOCK_POSITION)
  
  useEffect(() => {
    trackExperimentView(AB_EXPERIMENTS.TRUST_BLOCK_POSITION, trustBlockPosition)
  }, [trustBlockPosition])

  // Prefetch featured cars on mount
  useEffect(() => {
    prefetchFeaturedCars()
  }, [prefetchFeaturedCars])

  // Trust badges component (reusable) - Enhanced with modern design
  const TrustBadgesSection = useMemo(() => (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-dark-bg-primary dark:via-dark-bg-secondary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          {...motionProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.6 },
          })}
          className="text-center md:text-left mb-12 md:max-w-3xl mx-auto md:mx-0"
        >
          <h2 className="font-heading font-bold mb-4 text-gray-900 dark:text-dark-text-primary text-[clamp(1.75rem,2.5vw,2.5rem)] gradient-text">
            {t('home:trustTitle') || 'Why Trust SelfCar?'}
          </h2>
          <p className="text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto text-[clamp(1rem,1.2vw,1.125rem)]">
            {t('home:trustSubtitle') || 'Transparent, secure, and reliable car buying and selling'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Payments Safety */}
          <motion.div
            {...motionProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5, delay: 0 },
              whileHover: { y: -8, scale: 1.05 },
            })}
            className="card text-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
              <CreditCard className="text-white" size={32} />
            </div>
            <h3 className="font-heading font-bold mb-2 text-gray-900 dark:text-dark-text-primary text-[clamp(1.125rem,1.4vw,1.25rem)]">
              {t('home:paymentsSafety') || 'Payments Safety'}
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary text-[clamp(0.95rem,1vw,1rem)]">
              {t('home:paymentsSafetyDesc') || 'SSL encrypted transactions, secure payment gateway'}
            </p>
          </motion.div>

          {/* Verified Sellers */}
          <motion.div
            {...motionProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5, delay: 0.1 },
              whileHover: { y: -8, scale: 1.05 },
            })}
            className="card text-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h3 className="font-heading font-bold mb-2 text-gray-900 dark:text-dark-text-primary text-[clamp(1.125rem,1.4vw,1.25rem)]">
              {t('home:verifiedSellers') || 'Verified Sellers'}
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary text-[clamp(0.95rem,1vw,1rem)]">
              {t('home:verifiedSellersDesc') || 'All sellers verified with identity and vehicle checks'}
            </p>
          </motion.div>

          {/* Return Policy */}
          <motion.div
            {...motionProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5, delay: 0.2 },
              whileHover: { y: -8, scale: 1.05 },
            })}
            className="card text-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
              <ArrowRight className="text-white rotate-180" size={32} />
            </div>
            <h3 className="font-heading font-bold mb-2 text-gray-900 dark:text-dark-text-primary text-[clamp(1.125rem,1.4vw,1.25rem)]">
              {t('home:returnPolicy') || 'Return Policy'}
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary text-[clamp(0.95rem,1vw,1rem)]">
              {t('home:returnPolicyDesc') || '7-day return guarantee for quality issues'}
            </p>
          </motion.div>

          {/* Cancellation Policy */}
          <motion.div
            {...motionProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5, delay: 0.3 },
              whileHover: { y: -8, scale: 1.05 },
            })}
            className="card text-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
              <XCircle className="text-white" size={32} />
            </div>
            <h3 className="font-heading font-bold mb-2 text-gray-900 dark:text-dark-text-primary text-[clamp(1.125rem,1.4vw,1.25rem)]">
              {t('home:cancellationPolicy') || 'Cancellation Policy'}
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary text-[clamp(0.95rem,1vw,1rem)]">
              {t('home:cancellationPolicyDesc') || 'Free cancellation up to 24 hours before pickup'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  ), [t])

  // Render trust section based on AB test position
  const shouldRenderTrustAtTop = trustBlockPosition === 'top'
  const shouldRenderTrustAtMiddle = trustBlockPosition === 'middle'
  const shouldRenderTrustAtBottom = trustBlockPosition === 'bottom'

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    }
    if (searchTab === 'sell') {
      params.set('mode', 'sell')
    }
    navigate(`/cars?${params.toString()}`)
  }

  // Popular brands (simplified - in production, fetch from API)
  const popularBrands = ['Toyota', 'Honda', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW']
  
  // Body types from CarType enum
  const bodyTypes = Object.values(CarType)

  // Category shortcuts (mobile-thumbs-reach optimized)
  const categories = [
    { icon: <Car size={24} />, label: 'All Cars', link: '/cars', color: 'primary' },
    { icon: <TrendingUp size={24} />, label: 'Featured', link: '/cars?featured=true', color: 'accent' },
    { icon: <MapPin size={24} />, label: 'Near Me', link: '/cars?location=nearby', color: 'primary' },
    { icon: <Star size={24} />, label: 'Top Rated', link: '/cars?sort=rating', color: 'primary' },
  ]

  // Trust blocks
  const trustBlocks = [
    {
      icon: <Shield size={32} />,
      title: t('home:fullyInsured') || 'Fully Insured',
      description: t('home:fullyInsuredDesc') || 'All vehicles are fully covered',
      stat: '100%'
    },
    {
      icon: <Users size={32} />,
      title: t('home:wideSelection') || 'Wide Selection',
      description: t('home:wideSelectionDesc') || 'Choose from hundreds of vehicles',
      stat: '500+'
    },
    {
      icon: <Clock size={32} />,
      title: t('home:support24') || '24/7 Support',
      description: t('home:support24Desc') || 'Always here to help',
      stat: '24/7'
    },
    {
      icon: <DollarSign size={32} />,
      title: t('home:bestPrices') || 'Best Prices',
      description: t('home:bestPricesDesc') || 'Competitive rates guaranteed',
      stat: 'Best'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Search-First Hero Section - Enhanced with modern gradient */}
      <section className="relative gradient-bg text-white pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[8%] left-[4%] w-[clamp(10rem,18vw,20rem)] h-[clamp(10rem,18vw,20rem)] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[4%] w-[clamp(14rem,26vw,28rem)] h-[clamp(14rem,26vw,28rem)] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left max-w-4xl md:max-w-3xl mx-auto md:mx-0"
          >
            {/* Main Heading - Enhanced with modern styling */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-heading font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-2xl text-[clamp(2rem,6vw,4.5rem)]"
            >
              {t('home:title') || 'Find Your Perfect Car'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 text-white/90 max-w-2xl mx-auto font-light drop-shadow-lg text-[clamp(1rem,2vw,1.5rem)]"
            >
              {t('home:subtitle') || 'Rent premium vehicles with ease and confidence'}
            </motion.p>

            {/* Search-First: Tabs for Mua xe / Bán xe */}
            <div className="max-w-2xl md:max-w-3xl mx-auto md:mx-0 mb-8">
              {/* Tabs */}
              <div className="flex justify-center md:justify-start mb-4 bg-white/10 backdrop-blur-sm rounded-t-xl p-1">
                <button
                  type="button"
                  onClick={() => setSearchTab('buy')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    searchTab === 'buy'
                      ? 'bg-white text-primary-700 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('home:buyCar') || 'Mua xe'}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab('sell')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    searchTab === 'sell'
                      ? 'bg-white text-primary-700 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('home:sellCar') || 'Bán xe'}
                </button>
              </div>

              {/* Search Box - Enhanced with modern glassmorphism */}
              <motion.form 
                onSubmit={handleSearch} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchTab === 'buy'
                        ? (t('home:searchPlaceholder') || 'Search by brand, model, or location...')
                        : (t('home:sellPlaceholder') || 'List your car for sale...')
                    }
                    className="w-full px-6 py-4 pl-12 text-base md:text-lg rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-2xl backdrop-blur-xl bg-white/95 border-2 border-white/40 transition-all duration-300 hover:bg-white hover:shadow-3xl hover:border-white/60"
                    aria-label="Search cars"
                  />
                  <Search 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    size={20} 
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center justify-center gap-2 min-w-[8.75rem] shadow-2xl"
                >
                  <Search size={20} />
                  <span>{t('home:search') || 'Search'}</span>
                </motion.button>
              </motion.form>
            </div>

            {/* Quick Actions - Thumbs-reach optimized */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
              <Link 
                to="/cars" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              >
                {t('home:browseCars') || 'Browse All'}
              </Link>
              <Link 
                to="/cars?featured=true" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              >
                {t('home:featured') || 'Featured'}
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              >
                {t('home:signUp') || 'Sign Up'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promotional Strip */}
      <section className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="animate-pulse" />
              <p className="font-semibold text-lg">
                {t('home:promoTitle') || '🎉 Special Offer: Save up to 20% on your first booking!'}
              </p>
            </div>
            <Link
              to="/cars?featured=true"
              className="px-6 py-2 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <span>{t('home:viewOffers') || 'View Offers'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Cards - Quick Access */}
      <section className="py-12 bg-white dark:bg-dark-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-dark-text-primary text-center"
          >
            {t('home:quickAccess') || 'Quick Access'}
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <Link
                  to={category.link}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-tertiary dark:to-dark-bg-secondary hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group border border-gray-200 dark:border-dark-border-default hover:border-primary-300 dark:hover:border-primary-600 shadow-sm hover:shadow-lg"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color === 'accent' ? 'from-purple-500 to-pink-500' : 'from-primary-500 to-purple-600'} flex items-center justify-center shadow-md group-hover:shadow-xl transition-all text-white`}>
                    {category.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {category.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Brand - Enhanced with modern styling */}
      <section className="py-12 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-dark-text-primary"
          >
            {t('home:browseByBrand') || 'Browse by Brand'}
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularBrands.map((brand, index) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <Link
                  to={`/cars?brand=${encodeURIComponent(brand)}`}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-tertiary dark:to-dark-bg-secondary hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group shadow-sm hover:shadow-lg border border-gray-200 dark:border-dark-border-default hover:border-primary-300 dark:hover:border-primary-600"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all">
                    <Car className="text-white group-hover:scale-110 transition-transform duration-300" size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {brand}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Body Type - Enhanced */}
      <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary border-b border-gray-200 dark:border-dark-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-dark-text-primary"
          >
            {t('home:browseByBodyType') || 'Browse by Body Type'}
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {bodyTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <Link
                  to={`/cars?type=${type}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/90 backdrop-blur-sm dark:bg-dark-bg-secondary/90 hover:bg-white dark:hover:bg-dark-bg-tertiary transition-all duration-300 group border border-gray-200 dark:border-dark-border-default shadow-md hover:shadow-xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all">
                    <Car className="text-white group-hover:scale-125 transition-transform duration-300" size={32} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-dark-text-secondary text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section - AB Tested Position: Top */}
      {shouldRenderTrustAtTop && TrustBadgesSection}

      {/* Trust Badges Section - AB Tested Position: Middle */}
      {shouldRenderTrustAtMiddle && TrustBadgesSection}

      {/* Trust Badges Section - AB Tested Position: Bottom */}
      {shouldRenderTrustAtBottom && TrustBadgesSection}

      {/* Guides & News Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-dark-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
              {t('home:guidesNews') || 'Guides & News'}
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
              {t('home:guidesNewsSubtitle') || 'Learn about car buying, selling, and maintenance'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Guide Cards - In production, fetch from CMS/API */}
            {[
              { type: 'guide', title: 'How to Buy a Used Car', description: 'Complete guide to buying your first used car', icon: FileText },
              { type: 'guide', title: 'Selling Your Car: A Step-by-Step Guide', description: 'Tips and tricks for selling your car quickly', icon: FileText },
              { type: 'news', title: 'Latest Car Market Trends', description: 'Stay updated with the latest trends in the car market', icon: Newspaper },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-6 hover:shadow-lg transition-all border border-gray-200 dark:border-dark-border-default cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 dark:bg-primary-900/30 rounded-lg p-3 flex-shrink-0">
                    <item.icon className="text-primary-600 dark:text-primary-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1 block">
                      {item.type === 'guide' ? (t('home:guide') || 'Guide') : (t('home:news') || 'News')}
                    </span>
                    <h3 className="font-heading text-lg font-bold mb-2 text-gray-900 dark:text-dark-text-primary">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {t('home:viewAllGuides') || 'View All Guides & News'}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
