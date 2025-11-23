import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, X, Clock, TrendingUp } from 'lucide-react'
import { useCars } from '../hooks/useCars'
import CarCard from '../components/Cars/CarCard'
import CarFilters from '../components/Cars/CarFilters'
import SortSelector from '../components/Shared/SortSelector'
import Badge from '../components/Shared/Badge'
import { PageSkeleton, CardSkeleton } from '../components/Shared/LoadingSkeleton'
import { ErrorState } from '../components/Shared/ErrorState'
import { EmptyCars } from '../components/Shared/EmptyState'
import { usePrefetchCars } from '../hooks/usePrefetch'
import useSavedSearchStore from '../store/savedSearchStore'
import { useTranslation } from 'react-i18next'

// Memoized CarCard to prevent unnecessary re-renders
const MemoizedCarCard = memo(CarCard, (prevProps, nextProps) => {
  return prevProps.car.id === nextProps.car.id &&
         prevProps.car.available === nextProps.car.available &&
         prevProps.car.featured === nextProps.car.featured &&
         prevProps.car.imageUrl === nextProps.car.imageUrl
})

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { prefetchCars } = usePrefetchCars()
  const { t } = useTranslation()
  const { addSavedSearch, getAllSearches, deleteSavedSearch, updateLastUsed } = useSavedSearchStore()
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured')
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  
  const [filters, setFilters] = useState(() => {
    // Initialize filters from URL params
    return {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || '',
      transmission: searchParams.get('transmission') || '',
      fuelType: searchParams.get('fuelType') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      seats: searchParams.get('seats') || '',
      brand: searchParams.get('brand') || '',
      model: searchParams.get('model') || '',
      condition: searchParams.get('condition') || '',
      region: searchParams.get('region') || '',
      year: searchParams.get('year') || '',
      maxKm: searchParams.get('maxKm') || '',
    }
  })

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    if (sortBy && sortBy !== 'featured') {
      params.set('sort', sortBy)
    }
    setSearchParams(params, { replace: true })
  }, [filters, sortBy, setSearchParams])

  // Get filters from URL for API call - memoized to prevent unnecessary re-renders
  const appliedFilters = useMemo(() => {
    return Object.fromEntries(
      Array.from(searchParams.entries()).filter(([_, v]) => v)
    )
  }, [searchParams])

  const { data: cars, isLoading, error, refetch } = useCars(appliedFilters)

  // Sort cars based on sortBy
  const sortedCars = useMemo(() => {
    const list = Array.isArray(cars) ? cars : (cars?.content ?? [])
    if (!list || list.length === 0) return []
    
    const sorted = [...list]
    
    switch (sortBy) {
      case 'priceLow':
        return sorted.sort((a, b) => {
          const priceA = typeof a.pricePerDay === 'string' ? parseFloat(a.pricePerDay) : a.pricePerDay
          const priceB = typeof b.pricePerDay === 'string' ? parseFloat(b.pricePerDay) : b.pricePerDay
          return priceA - priceB
        })
      case 'priceHigh':
        return sorted.sort((a, b) => {
          const priceA = typeof a.pricePerDay === 'string' ? parseFloat(a.pricePerDay) : a.pricePerDay
          const priceB = typeof b.pricePerDay === 'string' ? parseFloat(b.pricePerDay) : b.pricePerDay
          return priceB - priceA
        })
      case 'newest':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
      case 'oldest':
        return sorted.sort((a, b) => (a.year || 0) - (b.year || 0))
      case 'nameAsc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      case 'nameDesc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      case 'featured':
      default:
        return sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
    }
  }, [cars, sortBy])

  // Determine car badges (New, Hot, Verified)
  const getCarBadges = useCallback((car) => {
    const badges = []
    const currentYear = new Date().getFullYear()
    
    // New badge - cars from current or last year
    if (car.year && (car.year >= currentYear - 1)) {
      badges.push('new')
    }
    
    // Hot badge - featured or high demand
    if (car.featured || (car.viewCount && car.viewCount > 100)) {
      badges.push('hot')
    }
    
    // Verified badge - if seller is verified (would need seller data)
    // For now, we'll use a simple heuristic
    if (car.verified || car.verifiedSeller) {
      badges.push('verified')
    }
    
    return badges
  }, [])

  // Handle save search
  const handleSaveSearch = useCallback(() => {
    const searchParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value)
    })
    if (sortBy && sortBy !== 'featured') {
      searchParams.set('sort', sortBy)
    }
    
    addSavedSearch(Object.fromEntries(searchParams.entries()))
    setShowSavedSearches(false)
  }, [filters, sortBy, addSavedSearch])

  // Handle load saved search
  const handleLoadSavedSearch = useCallback((savedSearch) => {
    setFilters(savedSearch.params)
    if (savedSearch.params.sort) {
      setSortBy(savedSearch.params.sort)
    }
    updateLastUsed(savedSearch.id)
    setShowSavedSearches(false)
  }, [updateLastUsed])

  const savedSearches = getAllSearches()

  // Prefetch cars on mount with current filters
  useEffect(() => {
    prefetchCars(appliedFilters)
  }, [prefetchCars, appliedFilters])

  const handleSearch = useCallback(() => {
    // Filters are already synced to URL via useEffect
    // This just triggers a refetch if needed
    refetch()
  }, [refetch])

  // Memoize the cars list to prevent unnecessary re-renders
  const memoizedCars = useMemo(() => {
    if (!cars || cars.length === 0) return null
    return cars
  }, [cars])

  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load cars"
        message={error.response?.data?.message || error.message || 'An error occurred while loading cars.'}
        onRetry={refetch}
        showHomeButton
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Enhanced with modern styling */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            Browse Our Fleet
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary text-lg md:text-xl font-light">
            Find the perfect car for your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CarFilters 
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
            />
          </div>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : sortedCars && sortedCars.length > 0 ? (
              <>
                {/* Sort & Actions Bar */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-border-default">
                  <div className="flex items-center gap-4 flex-wrap">
                    <p className="text-gray-600 dark:text-dark-text-secondary font-medium">
                      {t('common:cars.found') || 'Found'} <span className="text-primary-600 dark:text-primary-400 font-bold">{sortedCars.length}</span> {t('common:cars.cars') || 'cars'}
                    </p>
                    
                    {/* Saved Searches Button */}
                    {savedSearches.length > 0 && (
                      <button
                        onClick={() => setShowSavedSearches(!showSavedSearches)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-sm"
                      >
                        <BookmarkCheck size={16} />
                        <span>{t('common:cars.savedSearches') || 'Saved Searches'}</span>
                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {savedSearches.length}
                        </span>
                      </button>
                    )}
                    
                    {/* Save Search Button */}
                    <button
                      onClick={handleSaveSearch}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-sm"
                    >
                      <Bookmark size={16} />
                      <span>{t('common:cars.saveSearch') || 'Save Search'}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <SortSelector 
                      value={sortBy} 
                      onChange={setSortBy}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                {/* Saved Searches Dropdown */}
                {showSavedSearches && savedSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-border-default"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                        <Clock size={18} />
                        {t('common:cars.recentSearches') || 'Recent Searches'}
                      </h3>
                      <button
                        onClick={() => setShowSavedSearches(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {savedSearches.slice(0, 5).map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors group"
                        >
                          <button
                            onClick={() => handleLoadSavedSearch(search)}
                            className="flex-1 text-left"
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-dark-text-primary">
                              {search.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                              {Object.entries(search.params).slice(0, 3).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </p>
                          </button>
                          <button
                            onClick={() => deleteSavedSearch(search.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete search"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Cars Grid with Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedCars.map(car => {
                    const badges = getCarBadges(car)
                    return (
                      <div key={car.id} className="relative">
                        {/* Badges Overlay */}
                        {badges.length > 0 && (
                          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                            {badges.map((badge) => (
                              <Badge key={badge} type={badge} />
                            ))}
                          </div>
                        )}
                        <MemoizedCarCard car={car} />
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <EmptyCars onResetFilters={() => {
                setFilters({})
                setSearchParams({}, { replace: true })
                handleSearch()
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cars
