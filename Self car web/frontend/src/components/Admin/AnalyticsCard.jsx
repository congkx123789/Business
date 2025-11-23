import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Analytics Card Component
 * Displays metrics with trend indicators
 */
const AnalyticsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-100',
  gradient = 'from-blue-500 to-blue-600',
  loading = false,
  subtitle,
  className = '',
}) => {
  const getTrendIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp size={16} className="text-green-600" />
    } else if (changeType === 'negative') {
      return <TrendingDown size={16} className="text-red-600" />
    }
    return <Minus size={16} className="text-gray-400" />
  }

  const getChangeColor = () => {
    if (changeType === 'positive') {
      return 'text-green-600 bg-green-50'
    } else if (changeType === 'negative') {
      return 'text-red-600 bg-red-50'
    }
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card group hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-semibold mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>

      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getChangeColor()}`}>
          {getTrendIcon()}
          <span>
            {typeof change === 'number' 
              ? `${change > 0 ? '+' : ''}${change}%` 
              : change}
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  )
}

export default AnalyticsCard

