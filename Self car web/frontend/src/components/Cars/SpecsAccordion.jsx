import { useState } from 'react'
import { ChevronDown, ChevronUp, Users, Settings, Fuel, Calendar, Gauge, Car } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SpecsAccordion Component (FE-062)
 * 
 * Expandable specifications accordion with:
 * - Basic specs (always visible)
 * - Detailed specs (expandable)
 * - Organized by category
 */
const SpecsAccordion = ({ car }) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    performance: false,
    dimensions: false,
    features: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const basicSpecs = [
    { icon: Users, label: 'Seats', value: `${car?.seats} People` },
    { icon: Settings, label: 'Transmission', value: car?.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual' },
    { icon: Fuel, label: 'Fuel Type', value: car?.fuelType?.charAt(0) + car?.fuelType?.slice(1).toLowerCase() },
    { icon: Calendar, label: 'Year', value: car?.year },
  ]

  const performanceSpecs = [
    { label: 'Engine', value: car?.engine || 'N/A' },
    { label: 'Horsepower', value: car?.horsepower || 'N/A' },
    { label: 'Torque', value: car?.torque || 'N/A' },
    { label: '0-60 mph', value: car?.zeroToSixty || 'N/A' },
    { label: 'Top Speed', value: car?.topSpeed || 'N/A' },
  ]

  const dimensionSpecs = [
    { label: 'Length', value: car?.length || 'N/A' },
    { label: 'Width', value: car?.width || 'N/A' },
    { label: 'Height', value: car?.height || 'N/A' },
    { label: 'Wheelbase', value: car?.wheelbase || 'N/A' },
    { label: 'Curb Weight', value: car?.weight || 'N/A' },
  ]

  const featureSpecs = [
    { label: 'Air Conditioning', value: car?.features?.includes('air-conditioning') ? 'Yes' : 'No' },
    { label: 'Navigation', value: car?.features?.includes('navigation') ? 'Yes' : 'No' },
    { label: 'Bluetooth', value: car?.features?.includes('bluetooth') ? 'Yes' : 'No' },
    { label: 'USB Ports', value: car?.features?.includes('usb') ? 'Yes' : 'No' },
    { label: 'Parking Sensors', value: car?.features?.includes('parking-sensors') ? 'Yes' : 'No' },
  ]

  return (
    <div className="space-y-4">
      {/* Basic Specs - Always Visible */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-default">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {basicSpecs.map((spec, index) => {
            const Icon = spec.icon
            return (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg"
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Icon className="text-primary-600 dark:text-primary-400" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary font-medium">
                    {spec.label}
                  </p>
                  <p className="font-bold text-sm text-gray-900 dark:text-dark-text-primary">
                    {spec.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* Performance */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-default overflow-hidden">
          <button
            onClick={() => toggleSection('performance')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-expanded={expandedSections.performance}
          >
            <div className="flex items-center gap-3">
              <Gauge className="text-primary-600 dark:text-primary-400" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                Performance
              </h3>
            </div>
            {expandedSections.performance ? (
              <ChevronUp size={20} className="text-gray-500 dark:text-dark-text-tertiary" />
            ) : (
              <ChevronDown size={20} className="text-gray-500 dark:text-dark-text-tertiary" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.performance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  {performanceSpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border-default">
                      <span className="text-sm text-gray-600 dark:text-dark-text-secondary">{spec.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dimensions */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-default overflow-hidden">
          <button
            onClick={() => toggleSection('dimensions')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-expanded={expandedSections.dimensions}
          >
            <div className="flex items-center gap-3">
              <Car className="text-primary-600 dark:text-primary-400" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                Dimensions
              </h3>
            </div>
            {expandedSections.dimensions ? (
              <ChevronUp size={20} className="text-gray-500 dark:text-dark-text-tertiary" />
            ) : (
              <ChevronDown size={20} className="text-gray-500 dark:text-dark-text-tertiary" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.dimensions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  {dimensionSpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border-default">
                      <span className="text-sm text-gray-600 dark:text-dark-text-secondary">{spec.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-default overflow-hidden">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-expanded={expandedSections.features}
          >
            <div className="flex items-center gap-3">
              <Settings className="text-primary-600 dark:text-primary-400" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                Features
              </h3>
            </div>
            {expandedSections.features ? (
              <ChevronUp size={20} className="text-gray-500 dark:text-dark-text-tertiary" />
            ) : (
              <ChevronDown size={20} className="text-gray-500 dark:text-dark-text-tertiary" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.features && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  {featureSpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border-default">
                      <span className="text-sm text-gray-600 dark:text-dark-text-secondary">{spec.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SpecsAccordion

