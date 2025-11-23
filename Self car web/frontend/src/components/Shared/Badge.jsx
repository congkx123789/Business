import { useTranslation } from 'react-i18next'

/**
 * Badge Component
 * 
 * Displays localized badges (Free Shipping, Flash Sale, Vouchers, etc.)
 * Theme-aware and inherits locale from context.
 * 
 * @param {string} type - Badge type: 'freeShipping' | 'flashSale' | 'voucher' | 'new' | 'hot' | 'bestSeller' | 'verified'
 * @param {string} className - Additional CSS classes
 */
const Badge = ({ type, className = '' }) => {
  const { t } = useTranslation('common')
  
  const badgeConfig = {
    freeShipping: {
      label: t('badges.freeShipping'),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
    },
    flashSale: {
      label: t('badges.flashSale'),
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-400',
    },
    voucher: {
      label: t('badges.voucher'),
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-400',
    },
    new: {
      label: t('badges.new'),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    hot: {
      label: t('badges.hot'),
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-700 dark:text-orange-400',
    },
    bestSeller: {
      label: t('badges.bestSeller'),
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-400',
    },
    verified: {
      label: t('badges.verified') || 'Verified',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
    },
  }
  
  const config = badgeConfig[type] || badgeConfig.new
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
      aria-label={config.label}
    >
      {config.label}
    </span>
  )
}

export default Badge

