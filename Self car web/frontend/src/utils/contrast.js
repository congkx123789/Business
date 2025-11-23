/**
 * Contrast Checking Utilities
 * 
 * WCAG-compliant contrast ratio checking for accessibility.
 * Minimum contrast ratios:
 * - Normal text: 4.5:1 (WCAG AA)
 * - Large text: 3:1 (WCAG AA)
 * - Enhanced: 7:1 (WCAG AAA)
 */

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
function getLuminance(hex) {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  
  // Apply gamma correction
  const [rLin, gLin, bLin] = [r, g, b].map(val => {
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  
  // Calculate relative luminance
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - Hex color (e.g., '#ffffff')
 * @param {string} color2 - Hex color (e.g., '#000000')
 * @returns {number} Contrast ratio (1:1 to 21:1)
 */
export function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG AA standards for normal text
 * @param {string} foreground - Text color
 * @param {string} background - Background color
 * @returns {boolean} True if contrast ≥ 4.5:1
 */
export function meetsWCAGAA(foreground, background) {
  return getContrastRatio(foreground, background) >= 4.5
}

/**
 * Check if contrast meets WCAG AA standards for large text
 * @param {string} foreground - Text color
 * @param {string} background - Background color
 * @returns {boolean} True if contrast ≥ 3:1
 */
export function meetsWCAGAALarge(foreground, background) {
  return getContrastRatio(foreground, background) >= 3.0
}

/**
 * Check if contrast meets WCAG AAA standards
 * @param {string} foreground - Text color
 * @param {string} background - Background color
 * @returns {boolean} True if contrast ≥ 7:1
 */
export function meetsWCAGAAA(foreground, background) {
  return getContrastRatio(foreground, background) >= 7.0
}

/**
 * Get contrast level for a color pair
 * @returns {object} { level, ratio, passesAA, passesAAA }
 */
export function getContrastLevel(foreground, background) {
  const ratio = getContrastRatio(foreground, background)
  const passesAA = ratio >= 4.5
  const passesAALarge = ratio >= 3.0
  const passesAAA = ratio >= 7.0
  
  let level = 'fail'
  if (passesAAA) {
    level = 'AAA'
  } else if (passesAA) {
    level = 'AA'
  } else if (passesAALarge) {
    level = 'AA Large'
  }
  
  return {
    ratio: ratio.toFixed(2),
    level,
    passesAA,
    passesAALarge,
    passesAAA,
  }
}

/**
 * Validate color palette for accessibility
 * @param {object} palette - Color palette object
 * @returns {object} Validation results
 */
export function validateColorPalette(palette) {
  const results = {}
  
  // Test text colors against background colors
  Object.entries(palette).forEach(([name, colors]) => {
    if (typeof colors === 'object' && colors.text && colors.bg) {
      results[name] = getContrastLevel(colors.text, colors.bg)
    }
  })
  
  return results
}

export default {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAALarge,
  meetsWCAGAAA,
  getContrastLevel,
  validateColorPalette,
}

