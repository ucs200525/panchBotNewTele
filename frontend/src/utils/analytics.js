/**
 * Analytics Utility - User Fingerprinting & Page Tracking
 * 
 * Generates a persistent userId (UUID) stored in localStorage.
 * Sends x-user-id header on every API request.
 * Tracks frontend page visits by sending lightweight events to the backend.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// ── User ID Management ──────────────────────────────────────────────
const USER_ID_KEY = 'panchangam_user_id';

/**
 * Get or create a persistent user ID.
 * This survives page refreshes but not clearing localStorage.
 */
export const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

/**
 * Generate a UUID v4 (browser-compatible, no crypto dependency needed)
 */
function generateUUID() {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── API Request Headers ─────────────────────────────────────────────
/**
 * Returns standard headers that include the user ID.
 * Use this when making fetch() calls.
 */
export const getAnalyticsHeaders = () => {
  return {
    'x-user-id': getUserId(),
  };
};

// ── Page View Tracking ──────────────────────────────────────────────
let lastTrackedPage = null;

/**
 * Track a frontend page view.
 * Call this on route changes (e.g., inside useEffect in App.js).
 * 
 * @param {string} pagePath - The current route path (e.g., "/panchaka-swiss")
 */
export const trackPageView = (pagePath) => {
  // Avoid duplicate tracking of the same page
  if (pagePath === lastTrackedPage) return;
  lastTrackedPage = pagePath;

  const payload = {
    userId: getUserId(),
    page: pagePath,
    timestamp: new Date().toISOString(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent,
  };

  // Fire and forget - don't block the user
  fetch(`${API_URL}/api/analytics/pageview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getUserId(),
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    // Silently fail - analytics should never break the app
    console.debug('Analytics pageview error (non-blocking):', err.message);
  });
};

export default {
  getUserId,
  getAnalyticsHeaders,
  trackPageView,
};

// ── Global Fetch Interceptor ────────────────────────────────────────
/**
 * Monkey-patches window.fetch to automatically inject x-user-id header
 * into every request that goes to our API backend.
 * This means we DON'T need to modify every individual fetch() call.
 */
const installFetchInterceptor = () => {
  const originalFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    // Only inject for our own API
    const urlStr = typeof url === 'string' ? url : url?.url || '';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    if (urlStr.startsWith(apiUrl) || urlStr.startsWith('/api')) {
      options.headers = options.headers || {};
      // Support both plain object and Headers instance
      if (options.headers instanceof Headers) {
        if (!options.headers.has('x-user-id')) {
          options.headers.set('x-user-id', getUserId());
        }
      } else {
        if (!options.headers['x-user-id']) {
          options.headers['x-user-id'] = getUserId();
        }
      }
    }

    return originalFetch.call(this, url, options);
  };
};

// Install interceptor immediately when this module loads
installFetchInterceptor();

