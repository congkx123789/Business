/**
 * Design Tokens
 * 
 * Centralized design system tokens for spacing, colors, and border radius.
 * These tokens ensure consistency across the application.
 * 
 * Imports from tokens.json for single source of truth.
 */

import tokensData from './tokens.json'

// Export tokens from JSON for easy access
export const spacing = tokensData.spacing
export const radius = tokensData.radius
export const shadows = tokensData.shadow
export const motion = tokensData.motion
export const typography = tokensData.typography
export const zIndex = tokensData.zIndex
export const breakpoint = tokensData.breakpoint
export const focus = tokensData.focus

// Color system with light/dark mode
export const colors = {
  light: tokensData.color.light,
  dark: tokensData.color.dark,
}

// Export all tokens as a single object
export const tokens = {
  spacing,
  radius,
  colors,
  shadows,
  motion,
  typography,
  zIndex,
  breakpoint,
  focus,
}

// CSS Custom Properties for runtime use
export const cssVariables = {
  // Spacing (8pt grid)
  '--spacing-0': spacing['0'],
  '--spacing-1': spacing['1'],
  '--spacing-2': spacing['2'],
  '--spacing-3': spacing['3'],
  '--spacing-4': spacing['4'],
  '--spacing-5': spacing['5'],
  '--spacing-6': spacing['6'],
  '--spacing-8': spacing['8'],
  '--spacing-10': spacing['10'],
  '--spacing-12': spacing['12'],
  
  // Radius
  '--radius-none': radius.none,
  '--radius-sm': radius.sm,
  '--radius-md': radius.md,
  '--radius-lg': radius.lg,
  '--radius-xl': radius.xl,
  '--radius-2xl': radius['2xl'],
  '--radius-full': radius.full,
  
  // Motion
  '--motion-fast': motion.transition.fast,
  '--motion-normal': motion.transition.normal,
  '--motion-slow': motion.transition.slow,
  
  // Z-index
  '--z-dropdown': zIndex.dropdown,
  '--z-sticky': zIndex.sticky,
  '--z-fixed': zIndex.fixed,
  '--z-modal-backdrop': zIndex.modalBackdrop,
  '--z-modal': zIndex.modal,
  '--z-popover': zIndex.popover,
  '--z-tooltip': zIndex.tooltip,
  '--z-toast': zIndex.toast,
  
  // Focus
  '--focus-ring-width': focus.ring.width,
  '--focus-ring-offset': focus.ring.offset,
  '--focus-ring-color-light': focus.ring.color.light,
  '--focus-ring-color-dark': focus.ring.color.dark,
}

// Helper function to get theme-aware color
export function getThemeColor(theme, colorPath) {
  const themeColors = theme === 'dark' ? colors.dark : colors.light
  const parts = colorPath.split('.')
  let value = themeColors
  for (const part of parts) {
    value = value?.[part]
    if (!value) return null
  }
  return value
}

export default tokens
