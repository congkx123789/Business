/**
 * Script Integrity Monitoring
 * 
 * Implements PCI DSS 4.0 6.4.3 & 11.6.1 requirements for client-side script integrity.
 * Monitors payment page scripts for unauthorized modifications.
 */

/**
 * Calculates SHA-256 hash of script content
 */
async function calculateScriptHash(scriptContent) {
  const encoder = new TextEncoder();
  const data = encoder.encode(scriptContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Validates script integrity by comparing hash
 */
async function validateScriptIntegrity(scriptElement, expectedHash) {
  if (!scriptElement || !expectedHash) {
    return false;
  }

  try {
    // Get script content
    let scriptContent = '';
    
    if (scriptElement.src) {
      // External script - fetch and verify
      const response = await fetch(scriptElement.src);
      scriptContent = await response.text();
    } else {
      // Inline script
      scriptContent = scriptElement.textContent || scriptElement.innerHTML;
    }

    // Calculate hash
    const actualHash = await calculateScriptHash(scriptContent);
    
    // Constant-time comparison
    return constantTimeEquals(actualHash, expectedHash);
  } catch (error) {
    console.error('Script integrity check failed:', error);
    return false;
  }
}

/**
 * Constant-time string comparison
 */
function constantTimeEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Monitors all scripts on payment pages
 */
export function monitorPaymentPageScripts() {
  // Only run on payment/checkout pages
  if (!window.location.pathname.includes('/payment') && 
      !window.location.pathname.includes('/checkout')) {
    return;
  }

  console.info('Script integrity monitoring enabled for payment page');

  // Monitor script additions
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const script = node;
          const src = script.src || 'inline';
          
          // Log script addition for security monitoring
          console.warn('New script detected on payment page:', src);
          
          // In production, send to security monitoring endpoint
          if (import.meta.env.PROD) {
            reportSuspiciousScript(src);
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Monitor existing scripts
  document.querySelectorAll('script').forEach((script) => {
    const src = script.src || 'inline';
    console.info('Payment page script detected:', src);
  });

  // Monitor for script modifications (Prototype pollution protection)
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(this, tagName, options);
    
    if (tagName.toLowerCase() === 'script') {
      console.warn('Script creation detected via createElement:', tagName);
    }
    
    return element;
  };
}

/**
 * Reports suspicious script activity to backend
 */
async function reportSuspiciousScript(scriptSrc) {
  try {
    await fetch('/api/security/report-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scriptSrc,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Failed to report suspicious script:', error);
  }
}

/**
 * Validates Subresource Integrity (SRI) for external scripts
 */
export function validateSubresourceIntegrity() {
  document.querySelectorAll('script[src]').forEach((script) => {
    if (!script.integrity) {
      console.warn('Script without SRI attribute:', script.src);
      // In production, this should be logged
    }
  });
}

/**
 * Initializes script integrity monitoring
 */
export function initScriptIntegrityMonitoring() {
  // Only on payment pages
  if (window.location.pathname.includes('/payment') || 
      window.location.pathname.includes('/checkout')) {
    monitorPaymentPageScripts();
    validateSubresourceIntegrity();
  }
}

