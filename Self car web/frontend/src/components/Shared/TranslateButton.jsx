import { useState } from 'react'
import { Languages, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePreferencesStore } from '../../store/preferencesStore'
import { translateText } from '../../utils/translation'
import './TranslateButton.css'

/**
 * TranslateButton Component
 * 
 * Provides "Translate" button for UGC content (reviews, chat, messages).
 * Shows "View original" toggle after translation.
 * 
 * Features:
 * - Auto-detect source language
 * - Respects user locale preference
 * - Glossary support for brand/auto terms
 * - Accessible and theme-aware
 * 
 * @param {string} text - Original text to translate
 * @param {string} sourceLanguage - Source language code (optional, auto-detect if not provided)
 * @param {string} className - Additional CSS classes
 */
const TranslateButton = ({ text, sourceLanguage, className = '' }) => {
  const { i18n } = useTranslation()
  const { locale } = usePreferencesStore()
  const [translatedText, setTranslatedText] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [error, setError] = useState(null)
  
  // Target language is user's current locale
  const targetLanguage = locale?.split('-')[0] || i18n.language?.split('-')[0] || 'en'
  
  // Don't show translate button if already in target language
  const needsTranslation = sourceLanguage !== targetLanguage && 
                          (sourceLanguage || targetLanguage !== 'en')
  
  // Don't render if no text or already translated/doesn't need translation
  if (!text || !needsTranslation || (translatedText && !showOriginal)) {
    return null
  }
  
  const handleTranslate = async () => {
    if (translatedText) {
      // Toggle between original and translated
      setShowOriginal(!showOriginal)
      return
    }
    
    setIsTranslating(true)
    setError(null)
    
    try {
      const translated = await translateText(text, sourceLanguage, targetLanguage)
      setTranslatedText(translated)
      setShowOriginal(false)
    } catch (err) {
      console.error('Translation failed:', err)
      setError('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }
  
  const displayText = showOriginal ? text : (translatedText || text)
  
  return (
    <div className={`translate-button-container ${className}`}>
      <div className="translate-button-content">
        <p className="translate-button-text">{displayText}</p>
        
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="translate-button"
          aria-label={translatedText ? (showOriginal ? 'Show translation' : 'Show original') : 'Translate text'}
          title={translatedText ? (showOriginal ? 'Show translation' : 'Show original') : 'Translate to ' + targetLanguage}
        >
          {isTranslating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Languages size={14} />
              <span>{translatedText ? (showOriginal ? 'Show translation' : 'Show original') : 'Translate'}</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="translate-error" role="alert">
          {error}
        </div>
      )}
      
      {translatedText && (
        <div className="translate-attribution">
          Translated from {sourceLanguage || 'auto-detect'} to {targetLanguage}
        </div>
      )}
    </div>
  )
}

export default TranslateButton

