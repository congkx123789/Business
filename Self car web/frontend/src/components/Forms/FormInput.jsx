import { forwardRef } from 'react'
import { Input } from '../Foundation'
import { useFormContext } from 'react-hook-form'

/**
 * FormInput Component (FE-080)
 * 
 * Form input with React Hook Form integration and Zod validation.
 * Supports inline validation, masked inputs, and descriptive help text.
 */
export const FormInput = forwardRef(({
  name,
  label,
  type = 'text',
  mask,
  helperText,
  required = false,
  loading = false,
  success = false,
  successMessage,
  className = '',
  ...props
}, ref) => {
  const { register, formState: { errors, isSubmitting, isValidating } } = useFormContext()
  const error = errors[name]
  const fieldError = error?.message
  
  // Field-level loading state (when validating this specific field)
  const isFieldLoading = loading || (isValidating && isValidating[name])
  
  // Field-level success state
  const isFieldSuccess = success || (isValidating && !fieldError && !isFieldLoading)

  // Apply mask if provided
  const handleChange = (e) => {
    let value = e.target.value
    
    if (mask && type === 'text') {
      // Apply phone mask
      if (mask === 'phone') {
        value = value.replace(/\D/g, '')
        if (value.length > 0) {
          value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
        }
      }
      // Apply price mask
      else if (mask === 'price') {
        value = value.replace(/[^\d.]/g, '')
        const parts = value.split('.')
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('')
        }
        if (parts[1] && parts[1].length > 2) {
          value = parts[0] + '.' + parts[1].slice(0, 2)
        }
      }
      // Apply currency mask
      else if (mask === 'currency') {
        value = value.replace(/[^\d.]/g, '')
        const num = parseFloat(value) || 0
        value = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      
      e.target.value = value
    }
  }

  return (
    <Input
      ref={ref}
      label={label}
      type={type}
      error={fieldError}
      helperText={helperText}
      required={required}
      loading={isFieldLoading}
      success={isFieldSuccess}
      successMessage={successMessage}
      className={className}
      {...register(name)}
      {...props}
      onChange={(e) => {
        handleChange(e)
        if (props.onChange) {
          props.onChange(e)
        }
      }}
    />
  )
})

FormInput.displayName = 'FormInput'

export default FormInput

