/**
 * Icon Sizing Rules (FE-012)
 * 
 * Standardized icon sizes following 8pt grid system
 * All icons should use these sizes for consistency
 */

export const iconSizes = {
  // Small icons (16px) - Inline with text, compact spaces
  xs: 16,
  
  // Default icons (20px) - Standard UI elements
  sm: 20,
  
  // Medium icons (24px) - Buttons, cards, navigation
  md: 24,
  
  // Large icons (32px) - Headers, hero sections
  lg: 32,
  
  // Extra large icons (48px) - Empty states, illustrations
  xl: 48,
  
  // 2XL icons (64px) - Hero illustrations, landing pages
  '2xl': 64,
}

/**
 * Get icon size by context
 * @param {string} context - 'inline' | 'button' | 'card' | 'header' | 'hero' | 'empty'
 */
export const getIconSizeByContext = (context) => {
  const contextMap = {
    inline: iconSizes.xs,      // 16px - Next to text
    button: iconSizes.sm,      // 20px - Button icons
    card: iconSizes.md,        // 24px - Card icons
    header: iconSizes.md,     // 24px - Header icons
    hero: iconSizes.xl,        // 48px - Hero sections
    empty: iconSizes.xl,       // 48px - Empty states
    navigation: iconSizes.sm,  // 20px - Navigation items
    badge: iconSizes.xs,       // 16px - Badge icons
    tooltip: iconSizes.xs,    // 16px - Tooltip icons
  }
  
  return contextMap[context] || iconSizes.md
}

/**
 * Icon size constants for Lucide React
 * Use these in components: <Icon size={iconSizes.sm} />
 */
export default iconSizes

