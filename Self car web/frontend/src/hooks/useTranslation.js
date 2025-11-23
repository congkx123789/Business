import { useState, useCallback } from 'react'
import { translateText } from '../utils/translation'

/**
 * Hook for translating UGC content
 * 
 * Provides easy-to-use translation functionality with state management.
 * 
 * @param {string} originalText - Original text to translate
 * @param {string} sourceLanguage - Source language code (optional)
 * @returns {Object} Translation state and functions
 */
export const useContentTranslation = (originalText, sourceLanguage = null) => {
  const [translatedText, setTranslatedText] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState(null)
  const [showOriginal, setShowOriginal] = useState(true)
  
  const translate = useCallback(async (targetLanguage) => {
    if (!originalText || translatedText) {
      // Already translated or no text
      setShowOriginal(!showOriginal)
      return
    }
    
    setIsTranslating(true)
    setError(null)
    
    try {
      const translated = await translateText(originalText, sourceLanguage, targetLanguage)
      setTranslatedText(translated)
      setShowOriginal(false)
    } catch (err) {
      console.error('Translation failed:', err)
      setError(err.message || 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }, [originalText, sourceLanguage, translatedText, showOriginal])
  
  const toggleView = useCallback(() => {
    setShowOriginal(!showOriginal)
  }, [showOriginal])
  
  const reset = useCallback(() => {
    setTranslatedText(null)
    setShowOriginal(true)
    setError(null)
  }, [])
  
  return {
    originalText,
    translatedText,
    displayText: showOriginal ? originalText : (translatedText || originalText),
    isTranslating,
    error,
    showOriginal,
    translate,
    toggleView,
    reset,
  }
}

