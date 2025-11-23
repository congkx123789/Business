import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoadingSpinner from './components/Shared/LoadingSpinner'
import { PageSkeleton } from './components/Shared/LoadingSkeleton'
import SessionResume from './components/Auth/SessionResume'
import RateLimitHandler from './components/Auth/RateLimitHandler'
import BotChallengeHandler from './components/Auth/BotChallengeHandler'
import { preloadOnIdle } from './utils/preload'
import { useLocaleInit } from './hooks/useLocaleInit'
import { getTextDirection } from './utils/localeFormatting'
import './App.css'

/**
 * Code-split routes for better performance
 * Lazy load components to reduce initial bundle size
 * 
 * Route-based code splitting:
 * - Home and Cars: Critical above-the-fold routes
 * - Other routes: Loaded on demand
 */
const Home = lazy(() => import('./pages/Home'))
const Cars = lazy(() => import('./pages/Cars'))
const CarDetail = lazy(() => import('./pages/CarDetail'))
const Booking = lazy(() => import('./pages/Booking'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const OTPLogin = lazy(() => import('./pages/OTPLogin'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const LeadSubmission = lazy(() => import('./pages/LeadSubmission'))
const Messages = lazy(() => import('./pages/Messages'))
const OAuth2Callback = lazy(() => import('./pages/OAuth2Callback'))
const Settings = lazy(() => import('./pages/Settings'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminCars = lazy(() => import('./pages/Admin/Cars'))
const AdminBookings = lazy(() => import('./pages/Admin/Bookings'))
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'))
const SREDashboard = lazy(() => import('./pages/Admin/SREDashboard'))
const CacheDashboard = lazy(() => import('./pages/admin/CacheDashboard'))

/**
 * Focus management on route change for accessibility
 * WCAG 2.4.3: Focus Order - ensures focus moves to main content on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top on route change (with smooth behavior for better UX)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Focus management for accessibility - announce route change to screen readers
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
    if (mainContent) {
      // Make focusable temporarily
      mainContent.setAttribute('tabIndex', '-1')
      mainContent.focus()
      
      // Announce route change to screen readers
      const routeName = pathname.split('/').pop() || 'home'
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = `Navigated to ${routeName} page`
      document.body.appendChild(announcement)
      
      // Clean up after announcement
      setTimeout(() => {
        announcement.remove()
        mainContent.removeAttribute('tabindex')
      }, 1000)
    }
  }, [pathname])

  return null
}

function App() {
  // Initialize locale from URL, cookie, localStorage, or browser
  useLocaleInit()
  const { i18n } = useTranslation()
  
  // Set HTML direction for RTL support (FE-090)
  useEffect(() => {
    const direction = getTextDirection(i18n.language)
    document.documentElement.setAttribute('dir', direction)
    document.documentElement.setAttribute('lang', i18n.language || 'en')
    
    // Also update body class for easier CSS targeting
    document.body.classList.toggle('rtl', direction === 'rtl')
    document.body.classList.toggle('ltr', direction === 'ltr')
  }, [i18n.language])
  
  // Preload critical resources on idle
  useEffect(() => {
    preloadOnIdle()
  }, [])

  return (
    <>
      <ScrollToTop />
      <SessionResume />
      <RateLimitHandler />
      <BotChallengeHandler />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cars" element={
            <Suspense fallback={<PageSkeleton />}>
              <Cars />
            </Suspense>
          } />
          <Route path="cars/:id" element={<CarDetail />} />
          <Route path="cars/:carId/lead" element={<LeadSubmission />} />
          <Route path="login" element={<Login />} />
          <Route path="login/otp" element={<OTPLogin />} />
          <Route path="register" element={<Register />} />
          <Route path="auth/oauth2/callback" element={<OAuth2Callback />} />
          
          {/* Protected Routes */}
          <Route path="booking/:carId" element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="checkout/success/:bookingId" element={
            <ProtectedRoute>
              <CheckoutSuccess />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin/dashboard" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/cars" element={
            <ProtectedRoute adminOnly>
              <AdminCars />
            </ProtectedRoute>
          } />
          <Route path="admin/bookings" element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="admin/analytics" element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="admin/sre" element={
            <ProtectedRoute adminOnly>
              <SREDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/cache-dashboard" element={
            <ProtectedRoute adminOnly>
              <CacheDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}

export default App

