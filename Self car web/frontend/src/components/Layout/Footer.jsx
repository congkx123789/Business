import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Shield, HelpCircle, FileText, Globe, Lock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LocaleSwitcher from '../Locale/LocaleSwitcher'

/**
 * Footer Component (FE-032)
 * 
 * Footer with:
 * - Trust badges (payments safety, verified sellers, return policies)
 * - Help section
 * - Language selector
 * - Policy links
 */
const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden" role="contentinfo">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Trust Row - Enhanced (FE-032) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 border-b border-gray-700/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="flex items-center gap-4 text-white bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/30 flex items-center justify-center flex-shrink-0 border border-green-400/30">
              <Lock size={28} className="text-green-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-1">{t('common:footer.securePayment') || 'Secure Payment'}</h4>
              <p className="text-xs text-gray-300">{t('common:footer.securePaymentDesc') || 'SSL encrypted transactions'}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="flex items-center gap-4 text-white bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center flex-shrink-0 border border-blue-400/30">
              <CheckCircle size={28} className="text-blue-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-1">{t('common:footer.verifiedSellers') || 'Verified Sellers'}</h4>
              <p className="text-xs text-gray-300">{t('common:footer.verifiedSellersDesc') || 'All sellers verified'}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="flex items-center gap-4 text-white bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center flex-shrink-0 border border-purple-400/30">
              <Shield size={28} className="text-purple-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-1">{t('common:footer.returnPolicy') || 'Return Policy'}</h4>
              <p className="text-xs text-gray-300">{t('common:footer.returnPolicyDesc') || '7-day return guarantee'}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="flex items-center gap-4 text-white bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/30 flex items-center justify-center flex-shrink-0 border border-orange-400/30">
              <CheckCircle size={28} className="text-orange-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-1">{t('common:footer.cancellationPolicy') || 'Cancellation Policy'}</h4>
              <p className="text-xs text-gray-300">{t('common:footer.cancellationPolicyDesc') || 'Free cancellation up to 24h'}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4 lg:col-span-2">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">SelfCar</span>
            </motion.div>
            <p className="text-sm text-gray-400">
              {t('common:footer.description') || 'Premium car rental service offering the best vehicles at competitive prices. Your journey, our priority.'}
            </p>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <HelpCircle size={18} />
              {t('common:footer.help') || 'Help & Support'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.helpCenter') || 'Help Center'}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.contactUs') || 'Contact Us'}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.faq') || 'FAQ'}
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.guides') || 'Buying Guides'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText size={18} />
              {t('common:footer.policies') || 'Policies'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.terms') || 'Terms & Conditions'}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.privacy') || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.returnPolicy') || 'Return Policy'}
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-primary-400 transition-colors text-sm">
                  {t('common:footer.cancellationPolicy') || 'Cancellation Policy'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe size={18} />
              {t('common:footer.language') || 'Language'}
            </h3>
            <div className="mb-4">
              <LocaleSwitcher />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail size={16} />
                <span>info@selfcar.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin size={16} />
                <span>123 Car Street, NY 10001</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 mt-8 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} SelfCar. {t('common:footer.allRightsReserved') || 'All rights reserved.'}
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center hover:from-primary-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center hover:from-primary-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center hover:from-primary-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
