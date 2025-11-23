import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * Translate text using backend translation service
 * Never exposes API keys to the browser - all translation happens server-side
 * 
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (null for auto-detect)
 * @param {string} targetLanguage - Target language code (e.g., "en", "th")
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, sourceLanguage, targetLanguage) {
  if (!text || text.trim() === '') {
    return text
  }
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/translation/translate`,
      {
        text: text.trim(),
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage: targetLanguage,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    )
    
    if (response.data?.translatedText) {
      return response.data.translatedText
    }
    
    throw new Error('Invalid response from translation service')
    
  } catch (error) {
    console.error('Translation error:', error)
    
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data?.error || 'Translation service error')
    } else if (error.request) {
      // Request made but no response
      throw new Error('Translation service unavailable')
    } else {
      // Request setup error
      throw new Error('Failed to request translation')
    }
  }
}

/**
 * Batch translate multiple texts
 * 
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<Map<string, string>>} Map of original text to translated text
 */
export async function translateBatch(texts, sourceLanguage, targetLanguage) {
  if (!texts || texts.length === 0) {
    return new Map()
  }
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/translation/translate/batch`,
      {
        texts: texts,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage: targetLanguage,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout for batch
      }
    )
    
    if (response.data?.translations) {
      return new Map(Object.entries(response.data.translations))
    }
    
    throw new Error('Invalid response from batch translation service')
    
  } catch (error) {
    console.error('Batch translation error:', error)
    throw new Error(error.response?.data?.error || 'Batch translation failed')
  }
}

/**
 * Detect language of text
 * 
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} Detected language code
 */
export async function detectLanguage(text) {
  if (!text || text.trim().isEmpty()) {
    return 'en' // Default
  }
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/translation/detect`,
      { text: text.trim() },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    )
    
    return response.data?.language || 'en'
    
  } catch (error) {
    console.error('Language detection error:', error)
    return 'en' // Default fallback
  }
}

