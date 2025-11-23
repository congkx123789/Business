/**
 * Payment Page Monitoring
 * 
 * Enhanced script integrity monitoring for payment pages.
 * Includes script inventory and tamper detection.
 */

import { initScriptIntegrityMonitoring, monitorPaymentPageScripts } from './scriptIntegrity'

/**
 * Script Inventory for Payment Pages
 * Tracks all scripts loaded on payment pages for PCI compliance.
 */
const scriptInventory = {
  allowed: [
    // Payment gateway scripts (example - adjust for your gateway)
    'https://js.stripe.com',
    'https://www.paypal.com',
    // CDN scripts with SRI
    'https://cdn.jsdelivr.net',
  ],
  detected: [],
  suspicious: [],
}

/**
 * Detects and inventories scripts on payment page
 */
export function inventoryPaymentScripts() {
  const scripts = document.querySelectorAll('script')
  
  scripts.forEach((script) => {
    const src = script.src || 'inline'
    const integrity = script.integrity || null
    const scriptData = {
      src,
      integrity,
      type: script.type || 'text/javascript',
      async: script.async,
      defer: script.defer,
      timestamp: new Date().toISOString(),
    }
    
    scriptInventory.detected.push(scriptData)
    
    // Check if script is in allowed list
    const isAllowed = scriptInventory.allowed.some(allowed => src.includes(allowed))
    
    if (!isAllowed && src !== 'inline') {
      scriptInventory.suspicious.push(scriptData)
      console.warn('[Payment Monitoring] Suspicious script detected:', scriptData)
    }
    
    // Check for SRI on external scripts
    if (src && !src.startsWith('data:') && !integrity) {
      console.warn('[Payment Monitoring] External script without SRI:', src)
    }
  })
  
  return scriptInventory
}

/**
 * Tamper Detection
 * Monitors for unauthorized script modifications
 */
export function detectTampering() {
  const originalScripts = new Map()
  
  // Store original script content
  document.querySelectorAll('script').forEach((script, index) => {
    const key = script.src || `inline-${index}`
    originalScripts.set(key, {
      content: script.textContent || script.innerHTML,
      src: script.src,
    })
  })
  
  // Monitor for changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const script = node
          const key = script.src || `inline-${Date.now()}`
          
          // Check if this is a new script
          if (!originalScripts.has(key)) {
            console.error('[Payment Monitoring] Unauthorized script added:', {
              src: script.src,
              content: script.textContent?.substring(0, 100),
              timestamp: new Date().toISOString(),
            })
            
            // Report to backend
            reportTampering('script_added', {
              src: script.src,
              timestamp: new Date().toISOString(),
            })
          }
        }
      })
    })
  })
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  })
  
  return () => observer.disconnect()
}

/**
 * Reports tampering events to backend
 */
async function reportTampering(eventType, eventData) {
  try {
    await fetch('/api/security/report-tampering', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        ...eventData,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    })
  } catch (error) {
    console.error('Failed to report tampering:', error)
  }
}

/**
 * Initializes comprehensive payment page monitoring
 */
export function initPaymentPageMonitoring() {
  // Only on payment/checkout pages
  if (!window.location.pathname.includes('/payment') && 
      !window.location.pathname.includes('/checkout')) {
    return
  }
  
  console.info('[Payment Monitoring] Initializing payment page monitoring')
  
  // Initialize script integrity monitoring
  initScriptIntegrityMonitoring()
  monitorPaymentPageScripts()
  
  // Inventory scripts
  const inventory = inventoryPaymentScripts()
  console.info('[Payment Monitoring] Script inventory:', inventory)
  
  // Detect tampering
  const disconnectTamperDetection = detectTampering()
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    disconnectTamperDetection()
  })
  
  return {
    inventory,
    disconnect: disconnectTamperDetection,
  }
}

/**
 * Gets script inventory for evidence
 */
export function getScriptInventory() {
  return {
    ...scriptInventory,
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
  }
}

export default {
  initPaymentPageMonitoring,
  inventoryPaymentScripts,
  detectTampering,
  getScriptInventory,
}

