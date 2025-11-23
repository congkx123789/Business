/**
 * Skeleton Component
 * 
 * Loading skeleton component with shimmer effect for better perceived performance.
 * Supports various shapes and sizes.
 * 
 * @param {Object} props
 * @param {string} props.variant - 'text' | 'circular' | 'rectangular'
 * @param {string} props.width - Width (e.g., '100%', '200px')
 * @param {string} props.height - Height (e.g., '20px', '100%')
 * @param {string} props.className - Additional CSS classes
 */
export const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClasses = 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-dark-bg-tertiary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary bg-[length:1000px_100%]'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  }
  
  return (
    <div
      className={classes}
      style={style}
      aria-label="Loading..."
      role="status"
      {...props}
    />
  )
}

/**
 * SkeletonText Component
 * 
 * Skeleton for text content with multiple lines.
 * 
 * @param {Object} props
 * @param {number} props.lines - Number of lines
 * @param {string} props.width - Width of lines
 * @param {string} props.className - Additional CSS classes
 */
export const SkeletonText = ({
  lines = 3,
  width = '100%',
  className = '',
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '75%' : width}
          className={index > 0 ? 'mt-2' : ''}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonCard Component
 * 
 * Skeleton for card components.
 * 
 * @param {Object} props
 * @param {boolean} props.showAvatar - Show avatar skeleton
 * @param {boolean} props.showTitle - Show title skeleton
 * @param {boolean} props.showContent - Show content skeleton
 * @param {string} props.className - Additional CSS classes
 */
export const SkeletonCard = ({
  showAvatar = true,
  showTitle = true,
  showContent = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-4 border border-gray-200 dark:border-dark-border-default rounded-lg ${className}`} {...props}>
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton variant="circular" width="48px" height="48px" />
        )}
        <div className="flex-1">
          {showTitle && (
            <Skeleton variant="text" width="60%" height="24px" className="mb-2" />
          )}
          {showContent && (
            <SkeletonText lines={2} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Skeleton

