import tokensData from './src/design-tokens/tokens.json'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy (matches html[data-theme])
  theme: {
    extend: {
      // Spacing: 8pt grid system
      spacing: {
        ...tokensData.spacing,
        // Legacy aliases for backward compatibility
        'xs': tokensData.spacing['1'],
        'sm': tokensData.spacing['2'],
        'md': tokensData.spacing['3'],
        'lg': tokensData.spacing['4'],
        'xl': tokensData.spacing['6'],
        '2xl': tokensData.spacing['8'],
        '3xl': tokensData.spacing['12'],
        '4xl': tokensData.spacing['16'],
      },
      // Colors: Light and dark theme support
      colors: {
        // Primary colors (high contrast for accessibility)
        primary: {
          50: tokensData.color.light.primary['50'],
          100: tokensData.color.light.primary['100'],
          200: tokensData.color.light.primary['200'],
          300: tokensData.color.light.primary['300'],
          400: tokensData.color.light.primary['400'],
          500: tokensData.color.light.primary['500'],
          600: tokensData.color.light.primary['600'],
          700: tokensData.color.light.primary['700'],
          800: tokensData.color.light.primary['800'],
          900: tokensData.color.light.primary['900'],
        },
        // Accent colors (CTA actions)
        accent: {
          50: tokensData.color.light.accent['50'],
          100: tokensData.color.light.accent['100'],
          200: tokensData.color.light.accent['200'],
          300: tokensData.color.light.accent['300'],
          400: tokensData.color.light.accent['400'],
          500: tokensData.color.light.accent['500'],
          600: tokensData.color.light.accent['600'],
          700: tokensData.color.light.accent['700'],
          800: tokensData.color.light.accent['800'],
          900: tokensData.color.light.accent['900'],
        },
        // Semantic colors
        success: {
          DEFAULT: tokensData.color.light.semantic.success,
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: tokensData.color.light.semantic.success,
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        error: tokensData.color.light.semantic.error,
        warning: tokensData.color.light.semantic.warning,
        info: tokensData.color.light.semantic.info,
        // Gray scale
        gray: tokensData.color.light.gray,
        // Dark mode colors (Material Design compliant)
        dark: {
          bg: {
            primary: tokensData.color.dark.background.primary,
            secondary: tokensData.color.dark.background.secondary,
            tertiary: tokensData.color.dark.background.tertiary,
            elevated: tokensData.color.dark.background.elevated,
          },
          text: {
            primary: tokensData.color.dark.text.primary,
            secondary: tokensData.color.dark.text.secondary,
            tertiary: tokensData.color.dark.text.tertiary,
            disabled: tokensData.color.dark.text.disabled,
          },
          border: {
            default: tokensData.color.dark.border.default,
            subtle: tokensData.color.dark.border.subtle,
            strong: tokensData.color.dark.border.strong,
          },
        },
      },
      // Border radius
      borderRadius: {
        ...tokensData.radius,
        // Legacy aliases
        'sm': tokensData.radius.sm,
        'md': tokensData.radius.md,
        'lg': tokensData.radius.lg,
        'xl': tokensData.radius.xl,
        '2xl': tokensData.radius['2xl'],
        'full': tokensData.radius.full,
      },
      // Typography
      fontFamily: {
        ...tokensData.typography.fontFamily,
        sans: tokensData.typography.fontFamily.sans,
        heading: tokensData.typography.fontFamily.heading,
        display: tokensData.typography.fontFamily.display,
        mono: tokensData.typography.fontFamily.mono,
      },
      fontSize: {
        ...tokensData.typography.fontSize,
        'xs': tokensData.typography.fontSize.xs,
        'sm': tokensData.typography.fontSize.sm,
        'base': tokensData.typography.fontSize.base,
        'lg': tokensData.typography.fontSize.lg,
        'xl': tokensData.typography.fontSize.xl,
        '2xl': tokensData.typography.fontSize['2xl'],
        '3xl': tokensData.typography.fontSize['3xl'],
        '4xl': tokensData.typography.fontSize['4xl'],
        '5xl': tokensData.typography.fontSize['5xl'],
        '6xl': tokensData.typography.fontSize['6xl'],
      },
      fontWeight: {
        ...tokensData.typography.fontWeight,
        light: tokensData.typography.fontWeight.light,
        normal: tokensData.typography.fontWeight.normal,
        medium: tokensData.typography.fontWeight.medium,
        semibold: tokensData.typography.fontWeight.semibold,
        bold: tokensData.typography.fontWeight.bold,
        extrabold: tokensData.typography.fontWeight.extrabold,
        black: tokensData.typography.fontWeight.black,
      },
      lineHeight: {
        ...tokensData.typography.lineHeight,
        tight: tokensData.typography.lineHeight.tight,
        normal: tokensData.typography.lineHeight.normal,
        relaxed: tokensData.typography.lineHeight.relaxed,
        loose: tokensData.typography.lineHeight.loose,
      },
      letterSpacing: {
        ...tokensData.typography.letterSpacing,
        tighter: tokensData.typography.letterSpacing.tighter,
        tight: tokensData.typography.letterSpacing.tight,
        normal: tokensData.typography.letterSpacing.normal,
        wide: tokensData.typography.letterSpacing.wide,
        wider: tokensData.typography.letterSpacing.wider,
        widest: tokensData.typography.letterSpacing.widest,
      },
      // Shadows: 3 elevation layers
      boxShadow: {
        ...tokensData.shadow,
        'sm': tokensData.shadow.sm,
        'md': tokensData.shadow.md,
        'lg': tokensData.shadow.lg,
        'xl': tokensData.shadow.xl,
        '2xl': tokensData.shadow['2xl'],
        'soft': tokensData.shadow.soft,
        'elevation-1': tokensData.shadow['elevation-1'],
        'elevation-2': tokensData.shadow['elevation-2'],
        'elevation-3': tokensData.shadow['elevation-3'],
        'inner': tokensData.shadow.inner,
        'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
        'glow-lg': '0 0 40px rgba(102, 126, 234, 0.4)',
      },
      // Animation & transitions
      transitionDuration: {
        ...tokensData.motion.duration,
        'fast': tokensData.motion.duration.fast,
        'normal': tokensData.motion.duration.normal,
        'slow': tokensData.motion.duration.slow,
      },
      transitionTimingFunction: {
        ...tokensData.motion.easing,
        'ease-in': tokensData.motion.easing.easeIn,
        'ease-out': tokensData.motion.easing.easeOut,
        'ease-in-out': tokensData.motion.easing.easeInOut,
        'spring': tokensData.motion.easing.spring,
      },
      // Animation keyframes
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      // Z-index scale
      zIndex: {
        ...tokensData.zIndex,
        'dropdown': tokensData.zIndex.dropdown,
        'sticky': tokensData.zIndex.sticky,
        'fixed': tokensData.zIndex.fixed,
        'modal-backdrop': tokensData.zIndex.modalBackdrop,
        'modal': tokensData.zIndex.modal,
        'popover': tokensData.zIndex.popover,
        'tooltip': tokensData.zIndex.tooltip,
        'toast': tokensData.zIndex.toast,
      },
      // Breakpoints
      screens: {
        'sm': tokensData.breakpoint.sm,
        'md': tokensData.breakpoint.md,
        'lg': tokensData.breakpoint.lg,
        'xl': tokensData.breakpoint.xl,
        '2xl': tokensData.breakpoint['2xl'],
      },
    },
  },
  plugins: [
    function ({ addUtilities, addComponents, theme }) {
      // Focus ring system for accessibility
      addUtilities({
        '.focus-ring': {
          outline: `${tokensData.focus.ring.width} solid ${tokensData.focus.ring.color.light}`,
          outlineOffset: tokensData.focus.ring.offset,
          boxShadow: tokensData.focus.shadow.light,
        },
        '.dark .focus-ring': {
          outlineColor: tokensData.focus.ring.color.dark,
          boxShadow: tokensData.focus.shadow.dark,
        },
        // Screen reader only
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
        '.sr-only:focus, .sr-only:focus-within': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: 'inherit',
          margin: 'inherit',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        // Shimmer animation utility (FE-021)
        '.animate-shimmer': {
          animation: 'shimmer 2s linear infinite',
        },
      })
      
      // Component utilities
      addComponents({
        // 8pt grid spacing utilities
        '.spacing-8pt': {
          gap: tokensData.spacing['1'],
        },
        '.spacing-16pt': {
          gap: tokensData.spacing['2'],
        },
        '.spacing-24pt': {
          gap: tokensData.spacing['3'],
        },
        '.spacing-32pt': {
          gap: tokensData.spacing['4'],
        },
      })
    },
  ],
}
