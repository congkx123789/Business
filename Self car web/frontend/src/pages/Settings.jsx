import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import PreferencesForm from '../components/Profile/PreferencesForm'
import { Button } from '../components/Foundation'

/**
 * Settings Page
 * 
 * User settings and preferences page with progressive profiling
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('preferences')

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="text-primary-600 dark:text-primary-400" size={32} />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-default shadow-lg p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-default shadow-lg p-6"
            >
              {activeTab === 'preferences' && (
                <PreferencesForm onComplete={() => {}} />
              )}
              
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                    Profile Settings
                  </h2>
                  <p className="text-gray-600 dark:text-dark-text-secondary">
                    Profile settings coming soon...
                  </p>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                    Notification Settings
                  </h2>
                  <p className="text-gray-600 dark:text-dark-text-secondary">
                    Notification preferences coming soon...
                  </p>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                    Security Settings
                  </h2>
                  <p className="text-gray-600 dark:text-dark-text-secondary">
                    Security settings coming soon...
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

