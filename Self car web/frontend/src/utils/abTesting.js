/**
 * AB Testing Utility (FE-122)
 * 
 * Simple client-side AB testing for:
 * - Trust block position
 * - SRP filter density
 * - PDP CTA layout
 * 
 * Uses localStorage for consistent assignment per user
 */

const AB_EXPERIMENTS = {
  TRUST_BLOCK_POSITION: 'trust_block_position',
  SRP_FILTER_DENSITY: 'srp_filter_density',
  PDP_CTA_LAYOUT: 'pdp_cta_layout',
}

const VARIANTS = {
  [AB_EXPERIMENTS.TRUST_BLOCK_POSITION]: {
    CONTROL: 'top', // Before category cards
    VARIANT_A: 'middle', // After category cards, before body types
    VARIANT_B: 'bottom', // After body types, before guides
  },
  [AB_EXPERIMENTS.SRP_FILTER_DENSITY]: {
    CONTROL: 'compact', // Current default
    VARIANT_A: 'expanded', // More visible filters
    VARIANT_B: 'minimal', // Fewer filters visible
  },
  [AB_EXPERIMENTS.PDP_CTA_LAYOUT]: {
    CONTROL: 'horizontal', // Current default
    VARIANT_A: 'vertical', // Stacked buttons
    VARIANT_B: 'split', // Split primary/secondary
  },
}

/**
 * Get or assign variant for an experiment
 * @param {string} experiment - Experiment key
 * @returns {string} Variant key
 */
export const getExperimentVariant = (experiment) => {
  if (typeof window === 'undefined') return 'control'
  
  const storageKey = `ab_test_${experiment}`
  const stored = localStorage.getItem(storageKey)
  
  if (stored) {
    return stored
  }
  
  // Assign variant (50/25/25 split for control/variant_a/variant_b)
  const rand = Math.random()
  let variant
  
  if (rand < 0.5) {
    variant = 'control'
  } else if (rand < 0.75) {
    variant = 'variant_a'
  } else {
    variant = 'variant_b'
  }
  
  localStorage.setItem(storageKey, variant)
  
  // Track assignment
  if (window.gtag) {
    window.gtag('event', 'ab_test_assigned', {
      experiment_name: experiment,
      variant: variant,
    })
  }
  
  return variant
}

/**
 * Get specific variant value for an experiment
 * @param {string} experiment - Experiment key
 * @returns {string} Variant value
 */
export const getExperimentValue = (experiment) => {
  const variant = getExperimentVariant(experiment)
  const experimentVariants = VARIANTS[experiment]
  
  if (!experimentVariants) {
    console.warn(`Unknown experiment: ${experiment}`)
    return null
  }
  
  const variantKey = variant.toUpperCase()
  return experimentVariants[variantKey] || experimentVariants.CONTROL
}

/**
 * Track experiment exposure
 * @param {string} experiment - Experiment key
 * @param {string} variant - Variant key
 */
export const trackExperimentView = (experiment, variant) => {
  if (typeof window === 'undefined') return
  
  if (window.gtag) {
    window.gtag('event', 'ab_test_view', {
      experiment_name: experiment,
      variant: variant,
    })
  }
}

/**
 * Track experiment conversion
 * @param {string} experiment - Experiment key
 * @param {string} variant - Variant key
 * @param {string} conversionType - Type of conversion (e.g., 'click', 'purchase')
 */
export const trackExperimentConversion = (experiment, variant, conversionType = 'interaction') => {
  if (typeof window === 'undefined') return
  
  if (window.gtag) {
    window.gtag('event', 'ab_test_conversion', {
      experiment_name: experiment,
      variant: variant,
      conversion_type: conversionType,
    })
  }
}

export { AB_EXPERIMENTS, VARIANTS }

