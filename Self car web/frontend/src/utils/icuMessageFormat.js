/**
 * ICU MessageFormat Utilities
 * 
 * Provides ICU MessageFormat support for plurals, gender, and number/date formatting.
 * Uses i18next interpolation with ICU-like syntax.
 */

/**
 * Format ICU plural message
 * 
 * @param {string} message - ICU plural message format
 * @param {number} count - Count for pluralization
 * @param {object} options - Additional options
 * 
 * Example:
 * formatPlural('{count, plural, =0 {No items} =1 {One item} other {# items}}', 5)
 * Returns: "5 items"
 */
export function formatPlural(message, count, options = {}) {
  // Extract plural rules from message
  const pluralRules = new Intl.PluralRules(options.locale || 'en')
  const pluralForm = pluralRules.select(count)
  
  // Simple ICU plural parser (basic implementation)
  // In production, use a full ICU MessageFormat library like @formatjs/intl-messageformat
  const pattern = /\{(\w+),\s*plural,\s*([^}]+)\}/
  const match = message.match(pattern)
  
  if (!match) {
    return message
  }
  
  const [, varName, pluralRules] = match
  
  // Parse plural rules
  const rules = {}
  pluralRules.split(',').forEach(rule => {
    const trimmed = rule.trim()
    if (trimmed.includes('=')) {
      const [key, value] = trimmed.split('=').map(s => s.trim())
      rules[key] = value.replace(/[{}]/g, '').trim()
    } else if (trimmed.includes('other')) {
      rules.other = trimmed.replace(/other\s*\{?([^}]*)\}?/, '$1').trim()
    }
  })
  
  // Replace # with count
  const selectedRule = rules[pluralForm] || rules.other || rules['=0'] || ''
  return selectedRule.replace(/#/g, count.toString())
}

/**
 * Format ICU message with variables
 * 
 * @param {string} message - ICU message format
 * @param {object} variables - Variables to substitute
 * 
 * Example:
 * formatMessage('Hello {name}, you have {count, number} messages', { name: 'John', count: 5 })
 * Returns: "Hello John, you have 5 messages"
 */
export function formatMessage(message, variables = {}) {
  let result = message
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{${key}(?:,\\s*(\\w+))?\\}`, 'g')
    result = result.replace(pattern, (match, format) => {
      if (format === 'number') {
        return new Intl.NumberFormat('en-US').format(value)
      } else if (format === 'date') {
        return new Intl.DateTimeFormat('en-US').format(new Date(value))
      }
      return value
    })
  })
  
  return result
}

/**
 * Format ICU message with gender
 * 
 * @param {string} message - ICU message format with gender selector
 * @param {string} gender - Gender (male, female, other)
 * @param {object} variables - Additional variables
 * 
 * Example:
 * formatGender('{gender, select, male {He} female {She} other {They}} likes this', 'male')
 * Returns: "He likes this"
 */
export function formatGender(message, gender, variables = {}) {
  const pattern = /\{gender,\s*select,\s*([^}]+)\}/
  const match = message.match(pattern)
  
  if (!match) {
    return formatMessage(message, { gender, ...variables })
  }
  
  const [, selectRules] = match
  const rules = {}
  
  selectRules.split(',').forEach(rule => {
    const trimmed = rule.trim()
    const [key, value] = trimmed.split('{').map(s => s.trim().replace(/[{}]/g, ''))
    if (key && value) {
      rules[key] = value
    }
  })
  
  const selected = rules[gender] || rules.other || ''
  return message.replace(pattern, selected)
}

/**
 * Format message with ICU MessageFormat-like syntax
 * Combines plurals, gender, and variables
 */
export function formatICU(message, variables = {}) {
  let result = message
  
  // Handle plurals
  const pluralPattern = /\{(\w+),\s*plural,\s*([^}]+)\}/
  if (pluralPattern.test(result)) {
    const match = result.match(pluralPattern)
    const [, varName, pluralRules] = match
    const count = variables[varName] || 0
    const pluralForm = formatPlural(match[0], count, { locale: variables.locale || 'en' })
    result = result.replace(pluralPattern, pluralForm)
  }
  
  // Handle gender
  const genderPattern = /\{gender,\s*select,\s*([^}]+)\}/
  if (genderPattern.test(result)) {
    result = formatGender(result, variables.gender || 'other', variables)
  }
  
  // Handle other variables
  result = formatMessage(result, variables)
  
  return result
}

export default {
  formatPlural,
  formatMessage,
  formatGender,
  formatICU,
}

