import { useState, useRef, useEffect } from 'react'

/**
 * Tooltip Component
 * 
 * A fully accessible tooltip component with proper positioning and ARIA attributes.
 * Supports keyboard and pointer interactions.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string} props.content - Tooltip content
 * @param {string} props.placement - 'top' | 'bottom' | 'left' | 'right'
 * @param {number} props.delay - Delay in ms before showing tooltip
 */
export const Tooltip = ({
  children,
  content,
  placement = 'top',
  delay = 200,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const gap = 8

    let top = 0
    let left = 0

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - gap
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + gap
        break
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (left < 0) left = 8
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 8
    if (top < 0) top = 8
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 8

    setPosition({ top, left })
  }

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      requestAnimationFrame(updatePosition)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const triggerElement = typeof children === 'string' ? (
    <span ref={triggerRef}>{children}</span>
  ) : (
    <span ref={triggerRef} className="inline-block">
      {children}
    </span>
  )

  return (
    <>
      <span
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? `tooltip-${Math.random().toString(36).substr(2, 9)}` : undefined}
      >
        {triggerElement}
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          id={`tooltip-${Math.random().toString(36).substr(2, 9)}`}
          className={`fixed z-tooltip px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg pointer-events-none ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          {...props}
        >
          {content}
        </div>
      )}
    </>
  )
}

export default Tooltip

