import { Toaster } from 'react-hot-toast'

/**
 * Toast Component
 * 
 * Custom toast notification system using react-hot-toast.
 * Provides styled toast notifications with proper positioning and animations.
 * 
 * @param {Object} props
 * @param {string} props.position - Toast position ('top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right')
 */
export const Toast = ({
  position = 'top-right',
  ...props
}) => {
  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg, #ffffff)',
          color: 'var(--toast-color, #111827)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
          style: {
            background: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #93c5fd',
          },
        },
      }}
      {...props}
    />
  )
}

// Helper functions for toast notifications - re-export from react-hot-toast
import toastLib from 'react-hot-toast'
export const toast = toastLib

export default Toast

