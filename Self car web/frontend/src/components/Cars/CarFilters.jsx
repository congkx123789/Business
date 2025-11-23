import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, DollarSign, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CarType, Transmission, FuelType } from '../../types/api'
import { useLocale } from '../../hooks/useLocale'
import { Button, Input, Select } from '../Foundation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionProps } from '../../hooks/useMotion'
import { getExperimentValue, AB_EXPERIMENTS, trackExperimentView } from '../../utils/abTesting'

/**
 * CarFilters - 2-Level Filter System (FE-050)
 * 
 * Level-1 Quick Filters (sticky bar):
 * - Brand
 * - Model
 * - Price
 * - Condition
 * - Region
 * 
 * Level-2 Advanced Filters (drawer):
 * - Year
 * - Kilometers (km)
 * - Transmission
 * - Fuel Type
 * - Features
 * - Monthly Payment
 */
const CarFilters = ({ filters, setFilters, onSearch }) => {
  const { t } = useTranslation()
  const { locale, formatPrice } = useLocale()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({})
  const [isApplying, setIsApplying] = useState(false)
  
  // AB Test: Filter density
  const filterDensity = getExperimentValue(AB_EXPERIMENTS.SRP_FILTER_DENSITY)
  
  useEffect(() => {
    trackExperimentView(AB_EXPERIMENTS.SRP_FILTER_DENSITY, filterDensity)
  }, [filterDensity])
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key] && filters[key] !== '')

  // Popular brands (in production, fetch from API)
  const popularBrands = ['Toyota', 'Honda', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen']
  
  // Condition options
  const conditions = [
    { value: 'new', label: t('common:filters.conditionNew') || 'New' },
    { value: 'like-new', label: t('common:filters.conditionLikeNew') || 'Like New' },
    { value: 'excellent', label: t('common:filters.conditionExcellent') || 'Excellent' },
    { value: 'good', label: t('common:filters.conditionGood') || 'Good' },
    { value: 'fair', label: t('common:filters.conditionFair') || 'Fair' },
  ]

  // Region options
  const regions = [
    { value: 'hanoi', label: t('common:filters.regionHanoi') || 'Hanoi' },
    { value: 'hochiminh', label: t('common:filters.regionHoChiMinh') || 'Ho Chi Minh' },
    { value: 'danang', label: t('common:filters.regionDaNang') || 'Da Nang' },
    { value: 'cantho', label: t('common:filters.regionCanTho') || 'Can Tho' },
    { value: 'hue', label: t('common:filters.regionHue') || 'Hue' },
  ]

  // Features options
  const features = [
    { value: 'carplay', label: 'Apple CarPlay' },
    { value: 'android-auto', label: 'Android Auto' },
    { value: 'navigation', label: t('common:filters.featureNavigation') || 'Navigation' },
    { value: 'sunroof', label: t('common:filters.featureSunroof') || 'Sunroof' },
    { value: 'leather', label: t('common:filters.featureLeather') || 'Leather Seats' },
    { value: 'backup-camera', label: t('common:filters.featureBackupCamera') || 'Backup Camera' },
  ]

  // Generate year options (last 30 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const clearFilters = () => {
    setFilters({})
    setAppliedFilters({})
    onSearch()
  }

  const handleApply = () => {
    setIsApplying(true)
    setAppliedFilters({ ...filters })
    onSearch()
    // Visual feedback
    setTimeout(() => setIsApplying(false), 300)
  }

  // Check if filters have changed since last apply
  const hasUnsavedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters)

  return (
    <>
      {/* Level-1 Quick Filters - Sticky Bar with visual feedback */}
      <div className="sticky top-16 md:top-20 z-40 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-xl border-b border-gray-200 dark:border-dark-border-default shadow-sm transition-all duration-[120ms]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand */}
            <div className="flex-shrink-0 min-w-[8.75rem]">
              <Select
                label=""
                placeholder={t('common:filters.brand') || 'Brand'}
                options={[
                  { value: '', label: t('common:filters.allBrands') || 'All Brands' },
                  ...popularBrands.map(brand => ({ value: brand, label: brand }))
                ]}
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Model */}
            <div className="flex-1 min-w-[8.75rem]">
              <Input
                label=""
                type="text"
                placeholder={t('common:filters.modelPlaceholder') || 'Model...'}
                value={filters.model || ''}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2 min-w-[12.5rem]">
              <Input
                label=""
                type="number"
                placeholder={t('min') || 'Min'}
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="text-sm w-24"
              />
              <span className="text-gray-500 dark:text-dark-text-tertiary">-</span>
              <Input
                label=""
                type="number"
                placeholder={t('max') || 'Max'}
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="text-sm w-24"
              />
            </div>

            {/* Condition */}
            <div className="flex-shrink-0 min-w-[8.75rem]">
              <Select
                label=""
                placeholder={t('common:filters.condition') || 'Condition'}
                options={[
                  { value: '', label: t('common:filters.allConditions') || 'All Conditions' },
                  ...conditions.map(c => ({ value: c.value, label: c.label }))
                ]}
                value={filters.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Region */}
            <div className="flex-shrink-0 min-w-[8.75rem]">
              <Select
                label=""
                placeholder={t('common:filters.region') || 'Region'}
                options={[
                  { value: '', label: t('common:filters.allRegions') || 'All Regions' },
                  ...regions.map(r => ({ value: r.value, label: r.label }))
                ]}
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* More Filters Button */}
            <Button
              variant={isDrawerOpen ? 'primary' : 'secondary'}
              size="md"
              leftIcon={<Filter size={18} />}
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="flex-shrink-0"
            >
              {t('common:filters.moreFilters') || 'More Filters'}
            </Button>

            {/* Apply Button - Sticky, with visual feedback */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="primary"
                size="md"
                onClick={handleApply}
                loading={isApplying}
                className={`flex-shrink-0 transition-all duration-[120ms] ${
                  hasUnsavedChanges ? 'ring-2 ring-primary-400 ring-offset-2' : ''
                }`}
              >
                {t('applyFilters') || 'Apply'}
              </Button>
            </motion.div>

            {/* Clear Filters - Visual feedback on change */}
            {hasActiveFilters && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={<X size={18} />}
                  onClick={clearFilters}
                  className="flex-shrink-0 transition-all duration-[120ms]"
                >
                  {t('clear') || 'Clear'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Level-2 Advanced Filters - Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white dark:bg-dark-bg-secondary shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border-default pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                    <SlidersHorizontal size={20} />
                    {t('common:filters.advancedFilters') || 'Advanced Filters'}
                  </h3>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Advanced Filters */}
                <div className="space-y-5">
                  {/* Year */}
                  <div>
                    <Select
                      label={t('common:filters.year') || 'Year'}
                      options={[
                        { value: '', label: t('common:filters.anyYear') || 'Any Year' },
                        ...years.map(year => ({ value: year.toString(), label: year.toString() }))
                      ]}
                      value={filters.year || ''}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                    />
                  </div>

                  {/* Kilometers */}
                  <div>
                    <Input
                      label={t('common:filters.maxKilometers') || 'Max Kilometers'}
                      type="number"
                      placeholder={t('common:filters.maxKmPlaceholder') || 'e.g., 50000'}
                      value={filters.maxKm || ''}
                      onChange={(e) => handleFilterChange('maxKm', e.target.value)}
                    />
                  </div>

                  {/* Transmission */}
                  <div>
                    <Select
                      label={t('common:filters.transmission') || 'Transmission'}
                      options={[
                        { value: '', label: t('common:cars.all') || 'All' },
                        ...Object.values(Transmission).map(t => ({
                          value: t,
                          label: t === 'AUTOMATIC' ? (t('automatic') || 'Automatic') : (t('manual') || 'Manual')
                        }))
                      ]}
                      value={filters.transmission || ''}
                      onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <Select
                      label={t('common:filters.fuelType') || 'Fuel Type'}
                      options={[
                        { value: '', label: t('common:cars.all') || 'All' },
                        ...Object.values(FuelType).map(ft => ({
                          value: ft,
                          label: ft.charAt(0) + ft.slice(1).toLowerCase()
                        }))
                      ]}
                      value={filters.fuelType || ''}
                      onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      {t('common:filters.features') || 'Features'}
                    </label>
                    <div className="space-y-2">
                      {features.map((feature) => (
                        <label key={feature.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.features?.includes(feature.value) || false}
                            onChange={(e) => {
                              const currentFeatures = filters.features || []
                              if (e.target.checked) {
                                handleFilterChange('features', [...currentFeatures, feature.value])
                              } else {
                                handleFilterChange('features', currentFeatures.filter(f => f !== feature.value))
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                            {feature.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Payment */}
                  <div>
                    <Input
                      label={t('common:filters.maxMonthlyPayment') || 'Max Monthly Payment'}
                      type="number"
                      placeholder={t('common:filters.monthlyPaymentPlaceholder') || 'e.g., 5000000'}
                      value={filters.maxMonthlyPayment || ''}
                      onChange={(e) => handleFilterChange('maxMonthlyPayment', e.target.value)}
                      helperText={t('common:filters.monthlyPaymentHint') || 'For financing options'}
                    />
                  </div>
                </div>

                {/* Sticky Apply Button */}
                <div className="sticky bottom-0 bg-white dark:bg-dark-bg-secondary pt-4 border-t border-gray-200 dark:border-dark-border-default">
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      {t('clear') || 'Clear'}
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          handleApply()
                          setIsDrawerOpen(false)
                        }}
                        loading={isApplying}
                        className="w-full"
                      >
                        {t('applyFilters') || 'Apply'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default CarFilters

