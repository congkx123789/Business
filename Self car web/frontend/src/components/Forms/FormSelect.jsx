import { forwardRef } from 'react'
import { Select } from '../Foundation'
import { useFormContext } from 'react-hook-form'

/**
 * FormSelect Component (FE-080)
 * 
 * Form select with React Hook Form integration and Zod validation.
 * Supports inline validation and descriptive help text.
 */
export const FormSelect = forwardRef(({
  name,
  label,
  options = [],
  placeholder,
  helperText,
  required = false,
  className = '',
  ...props
}, ref) => {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]
  const fieldError = error?.message

  return (
    <Select
      ref={ref}
      label={label}
      placeholder={placeholder}
      options={options}
      error={fieldError}
      helperText={helperText}
      required={required}
      className={className}
      {...register(name)}
      {...props}
    />
  )
})

FormSelect.displayName = 'FormSelect'

export default FormSelect

