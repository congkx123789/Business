import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Skip Links Component
 * 
 * Provides keyboard-accessible skip links for screen readers and keyboard users.
 * Allows users to skip navigation and jump directly to main content.
 * 
 * WCAG 2.4.1: Bypass Blocks - Level A
 */
const SkipLinks = () => {
  const { t } = useTranslation()
  const mainContentRef = useRef(null)
  const skipNavRef = useRef(null)

  useEffect(() => {
    // Focus main content when skip link is clicked
    const handleSkipToMain = (e) => {
      e.preventDefault()
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
      if (mainContent) {
        // Make focusable temporarily
        mainContent.setAttribute('tabindex', '-1')
        mainContent.focus()
        // Remove tabindex after focus to prevent it from being in tab order
        setTimeout(() => {
          mainContent.removeAttribute('tabindex')
        }, 100)
      }
    }

    const skipNav = skipNavRef.current
    if (skipNav) {
      skipNav.addEventListener('click', handleSkipToMain)
      return () => {
        skipNav.removeEventListener('click', handleSkipToMain)
      }
    }
  }, [])

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-[100]">
      <a
        href="#main-content"
        ref={skipNavRef}
        className="bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium focus:outline-none focus:ring-4 focus:ring-primary-300 focus:ring-offset-2 inline-block"
        onFocus={(e) => {
          // Ensure visibility when focused
          e.target.parentElement.classList.remove('sr-only')
          e.target.parentElement.classList.add('block')
        }}
        onBlur={(e) => {
          // Hide when not focused
          e.target.parentElement.classList.add('sr-only')
          e.target.parentElement.classList.remove('block')
        }}
      >
        {t('common:skipToMain') || 'Skip to main content'}
      </a>
      <a
        href="#main-navigation"
        className="bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium focus:outline-none focus:ring-4 focus:ring-primary-300 focus:ring-offset-2 ml-4 inline-block"
        onClick={(e) => {
          e.preventDefault()
          const nav = document.querySelector('nav')
          if (nav) {
            const firstLink = nav.querySelector('a, button')
            if (firstLink) {
              firstLink.focus()
            }
          }
        }}
      >
        {t('common:skipToNav') || 'Skip to navigation'}
      </a>
    </div>
  )
}

export default SkipLinks

