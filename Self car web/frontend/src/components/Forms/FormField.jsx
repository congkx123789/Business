import { forwardRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input, Select } from '../Foundation'
import MaskedInput from './MaskedInput'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

/**
 * FormField Component (FE-080)
 * 
 * Enhanced form field with:
 * - Inline validation (real-time)
 * - Descriptive help text
 * - Masked input support
 * - Zod + RHF integration
 */
const FormField = forwardRef(({
  name,
  label,
  type = 'text',
  mask,
  customMask,
  placeholder,
  helperText,
  required = false,
  validationMode = 'onChange', // 'onChange' | 'onBlur' | 'onSubmit'
  as = 'input', // 'input' | 'select' | 'masked'
  options, // For select
  ...props
}, ref) => {
  const { control, formState: { errors, touchedFields } } = useFormContext()
  const error = errors[name]
  const isTouched = touchedFields[name]
  const showError = error && (validationMode === 'onChange' || isTouched)
  const showSuccess = !error && isTouched && props.value

  // Get validation state
  const getValidationState = () => {
    if (showError) return 'error'
    if (showSuccess) return 'success'
    return 'default'
  }

  const validationState = getValidationState()

  const renderInput = (field) => {
    const inputProps = {
      ...field,
      ...props,
      label,
      placeholder,
      error: showError ? error.message : undefined,
      helperText: !showError ? helperText : undefined,
      required,
      'aria-describedby': error ? `${name}-error` : helperText ? `${name}-helper` : undefined,
    }

    if (as === 'select') {
      return <Select {...inputProps} options={options || []} />
    }

    if (as === 'masked' || mask) {
      return (
        <MaskedInput
          {...inputProps}
          mask={mask}
          customMask={customMask}
          type={type}
        />
      )
    }

    if (type === 'textarea') {
      return (
        <textarea
          {...inputProps}
          rows={props.rows || 4}
          className={inputProps.className?.replace('input-field', 'textarea-field') || 'w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 bg-white dark:bg-dark-bg-secondary dark:border-dark-border-default'}
        />
      )
    }

    return <Input {...inputProps} type={type} />
  }

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        rules={props.rules}
        render={({ field }) => (
          <div className="relative">
            {renderInput(field)}
            
            {/* Inline Validation Icons */}
            <AnimatePresence>
              {validationState !== 'default' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ top: label ? 'calc(50% + 12px)' : '50%' }}
                >
                  {validationState === 'error' && (
                    <AlertCircle size={20} className="text-red-500" />
                  )}
                  {validationState === 'success' && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      />

      {/* Enhanced Help Text */}
      {helperText && !showError && (
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>{helperText}</span>
        </div>
      )}

      {/* Error Message with Animation */}
      {showError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
          id={`${name}-error`}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error.message}</span>
        </motion.div>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField

