import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePreferencesStore } from '../../store/preferencesStore'
import { getEffectiveTheme } from '../../utils/theme'

/**
 * ChatEntryPoint Component
 * 
 * Buyer-seller chat entry point that inherits theme & locale.
 * Prepares for future chat backend integration.
 * 
 * @param {string} sellerId - Optional seller ID for direct messaging
 * @param {string} productId - Optional product ID for product-specific chat
 * @param {string} className - Additional CSS classes
 * @param {string} variant - 'floating' | 'inline' (default: 'floating')
 */
const ChatEntryPoint = ({ sellerId, productId, className = '', variant = 'floating' }) => {
  const { t } = useTranslation('common')
  const { theme, locale } = usePreferencesStore()
  const effectiveTheme = getEffectiveTheme(theme)
  
  const handleChatClick = () => {
    // TODO: Implement chat navigation/modal
    // For now, navigate to messages page or open chat modal
    console.log('Chat clicked', { sellerId, productId, theme: effectiveTheme, locale })
    
    // Future: Open chat modal or navigate to chat page
    // window.location.href = `/messages?sellerId=${sellerId}&productId=${productId}`
  }
  
  if (variant === 'floating') {
    return (
      <button
        onClick={handleChatClick}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 dark:bg-primary-500 text-white shadow-lg hover:bg-primary-700 dark:hover:bg-primary-400 transition-all hover:scale-110 ${className}`}
        aria-label={t('chat.contactSeller') || 'Contact seller'}
        title={t('chat.contactSeller') || 'Contact seller'}
      >
        <MessageCircle size={24} />
      </button>
    )
  }
  
  // Inline variant
  return (
    <button
      onClick={handleChatClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-400 transition-colors ${className}`}
      aria-label={t('chat.contactSeller') || 'Contact seller'}
    >
      <MessageCircle size={18} />
      <span className="text-sm font-medium">{t('chat.contactSeller') || 'Contact Seller'}</span>
    </button>
  )
}

export default ChatEntryPoint

