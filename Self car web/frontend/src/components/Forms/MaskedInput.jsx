import { useState, useEffect, forwardRef } from 'react'
import { Input } from '../Foundation'

/**
 * MaskedInput Component (FE-080)
 * 
 * Input with masking for phone numbers, prices, etc.
 * Supports inline validation patterns
 */
const MaskedInput = forwardRef(({
  type = 'text',
  mask = 'phone', // 'phone' | 'price' | 'credit-card' | 'date' | 'custom'
  customMask,
  onChange,
  value,
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(value || '')

  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value || '')
    }
  }, [value])

  const applyPhoneMask = (input) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '')
    
    // Apply (XXX) XXX-XXXX format
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const applyPriceMask = (input) => {
    // Remove all non-digits except decimal point
    const cleaned = input.replace(/[^\d.]/g, '')
    
    // Only allow one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2)
    }
    
    return cleaned
  }

  const applyCreditCardMask = (input) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '').slice(0, 16)
    
    // Apply XXXX XXXX XXXX XXXX format
    return digits.match(/.{1,4}/g)?.join(' ') || digits
  }

  const applyDateMask = (input) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '').slice(0, 8)
    
    // Apply MM/DD/YYYY format
    if (digits.length <= 2) {
      return digits
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    }
  }

  const applyMask = (input) => {
    if (customMask) {
      return customMask(input)
    }

    switch (mask) {
      case 'phone':
        return applyPhoneMask(input)
      case 'price':
        return applyPriceMask(input)
      case 'credit-card':
        return applyCreditCardMask(input)
      case 'date':
        return applyDateMask(input)
      default:
        return input
    }
  }

  const handleChange = (e) => {
    const inputValue = e.target.value
    const maskedValue = applyMask(inputValue)
    
    setDisplayValue(maskedValue)
    
    // Call original onChange with unmasked value for form state
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: mask === 'phone' ? maskedValue.replace(/\D/g, '') : maskedValue,
        },
      }
      onChange(syntheticEvent)
    }
  }

  return (
    <Input
      ref={ref}
      type={type === 'password' ? 'password' : 'text'}
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  )
})

MaskedInput.displayName = 'MaskedInput'

export default MaskedInput

