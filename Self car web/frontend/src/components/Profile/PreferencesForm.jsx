import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePreferencesStore } from '../../store/preferencesStore'
import { useTranslation } from 'react-i18next'
import { Button, Input, Select, Switch } from '../Foundation'
import { profilePreferencesSchema } from '../../utils/validation'
import { Globe, Palette, DollarSign, Ruler, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

/**
 * PreferencesForm Component (FE-072)
 * 
 * Progressive profiling form for user preferences:
 * - Locale selection
 * - Theme preference
 * - Currency
 * - Units (metric/imperial)
 * - Interests (optional)
 */
const PreferencesForm = ({ onComplete, showTitle = true }) => {
  const preferences = usePreferencesStore()
  const { t, i18n } = useTranslation()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(profilePreferencesSchema),
    defaultValues: {
      locale: preferences.locale,
      theme: preferences.theme,
      currency: preferences.currency,
      units: preferences.units,
      interests: preferences.interests || [],
    },
  })

  const watchedTheme = watch('theme')

  const onSubmit = async (data) => {
    try {
      // Update preferences store
      if (data.locale) {
        preferences.setLocale(data.locale)
        i18n.changeLanguage(data.locale)
      }
      if (data.theme) {
        preferences.setTheme(data.theme)
      }
      if (data.currency) {
        preferences.setCurrency(data.currency)
      }
      if (data.units) {
        preferences.setUnits(data.units)
      }

      // Persist to account (if authenticated)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const authStorage = localStorage.getItem('auth-storage')
      
      if (authStorage) {
        const authData = JSON.parse(authStorage)
        const token = authData?.state?.token

        if (token) {
          await fetch(`${API_BASE_URL}/users/me/preferences`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          })
        }
      }

      toast.success('Preferences saved successfully!')
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.')
      console.error('Error saving preferences:', error)
    }
  }

  const interestsOptions = [
    'SUV',
    'Sedan',
    'Sports Car',
    'Electric Vehicle',
    'Luxury',
    'Budget',
    'Family',
    'Performance',
  ]

  const toggleInterest = (interest) => {
    const current = watch('interests') || []
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest]
    setValue('interests', updated)
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
          Your Preferences
        </h2>
      )}

      {/* Locale */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          <Globe size={18} />
          Language
        </label>
        <Select
          label=""
          options={[
            { value: 'en', label: 'English' },
            { value: 'en-US', label: 'English (US)' },
            { value: 'th', label: 'ไทย (Thai)' },
            { value: 'th-TH', label: 'ไทย (Thailand)' },
          ]}
          {...register('locale')}
          error={errors.locale?.message}
        />
      </div>

      {/* Theme */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          <Palette size={18} />
          Theme
        </label>
        <Select
          label=""
          options={[
            { value: 'system', label: 'System Default' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          {...register('theme')}
          error={errors.theme?.message}
        />
        {watchedTheme && (
          <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
            Preview: {watchedTheme === 'system' ? 'Follows your device settings' : `${watchedTheme} mode`}
          </p>
        )}
      </div>

      {/* Currency */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          <DollarSign size={18} />
          Currency
        </label>
        <Select
          label=""
          options={[
            { value: 'USD', label: 'USD ($)' },
            { value: 'THB', label: 'THB (฿)' },
          ]}
          {...register('currency')}
          error={errors.currency?.message}
        />
      </div>

      {/* Units */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          <Ruler size={18} />
          Units
        </label>
        <Select
          label=""
          options={[
            { value: 'metric', label: 'Metric (km, L)' },
            { value: 'imperial', label: 'Imperial (mi, gal)' },
          ]}
          {...register('units')}
          error={errors.units?.message}
        />
      </div>

      {/* Interests (Optional) */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-3">
          <Heart size={18} />
          Interests (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {interestsOptions.map((interest) => {
            const selected = (watch('interests') || []).includes(interest)
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selected
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary'
                }`}
              >
                {interest}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
          Help us personalize your experience
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
      >
        Save Preferences
      </Button>
    </motion.form>
  )
}

export default PreferencesForm

