import { useState } from 'react'
import { User, Star, CheckCircle, MessageCircle, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { Button } from '../Foundation'
import { motion } from 'framer-motion'

/**
 * SellerCard Component (FE-062)
 * 
 * Seller information card with:
 * - Seller profile
 * - Verification badge
 * - Rating and reviews
 * - Contact options
 * - Response time
 */
const SellerCard = ({ seller, onContact, onMessage }) => {
  // Mock seller data - in production, fetch from API
  const sellerData = seller || {
    id: 1,
    name: 'Premium Car Dealer',
    email: 'dealer@selfcar.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    verified: true,
    rating: 4.8,
    reviews: 127,
    responseTime: 'Usually responds within 2 hours',
    memberSince: '2020',
    listings: 45,
  }

  const handleContact = () => {
    if (onContact) {
      onContact(sellerData)
    }
  }

  const handleMessage = () => {
    if (onMessage) {
      onMessage(sellerData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-default shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {sellerData.name?.[0]?.toUpperCase() || 'S'}
          </div>
          {sellerData.verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-dark-bg-secondary">
              <CheckCircle size={16} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-dark-text-primary truncate">
              {sellerData.name}
            </h3>
            {sellerData.verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                <CheckCircle size={12} />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-sm text-gray-900 dark:text-dark-text-primary">
                {sellerData.rating}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
              ({sellerData.reviews} reviews)
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
            Member since {sellerData.memberSince} • {sellerData.listings} listings
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
          <MapPin size={16} />
          <span>{sellerData.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
          <Calendar size={16} />
          <span>{sellerData.responseTime}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-dark-border-default">
        <Button
          variant="primary"
          size="md"
          leftIcon={<MessageCircle size={18} />}
          onClick={handleMessage}
          className="w-full"
        >
          Message Seller
        </Button>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<Phone size={18} />}
          onClick={handleContact}
          className="w-full"
        >
          Contact Seller
        </Button>
      </div>

      {/* Contact Details (Collapsible) */}
      <details className="mt-4">
        <summary className="text-sm text-gray-600 dark:text-dark-text-secondary cursor-pointer hover:text-primary-600 dark:hover:text-primary-400">
          Show contact details
        </summary>
        <div className="mt-3 space-y-2 pt-3 border-t border-gray-200 dark:border-dark-border-default">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            <Mail size={16} />
            <a href={`mailto:${sellerData.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {sellerData.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            <Phone size={16} />
            <a href={`tel:${sellerData.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {sellerData.phone}
            </a>
          </div>
        </div>
      </details>
    </motion.div>
  )
}

export default SellerCard

