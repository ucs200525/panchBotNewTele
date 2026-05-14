/**
 * Analytics Utility - User Fingerprinting & Page Tracking
 * 
 * Generates a persistent userId (UUID) stored in localStorage.
 * Sends x-user-id header on every API request.
 * Tracks frontend page visits by sending lightweight events to the backend.
 */

// Helper to get the API URL and ensure no trailing slash
const getApiUrl = () => {
  let url = process.env.REACT_APP_API_URL || '';
  
  if (!url) {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        url = 'http://localhost:4000';
      } else {
        // In production, we fallback to relative but warn because it might fail if backend is on different domain
        url = window.location.origin;
        console.warn('[Analytics] REACT_APP_API_URL is NOT set. Analytics may fail if backend is on a different domain.');
      }
    } else {
      url = 'http://localhost:4000';
    }
  }
  
  const cleanUrl = url.replace(/\/$/, '');
  return cleanUrl;
};

const API_URL = getApiUrl();

// ── User ID Management ──────────────────────────────────────────────
const USER_ID_KEY = 'panchangam_user_id';

/**
 * Get or create a persistent user ID.
 */
export const getUserId = () => {
  if (typeof window === 'undefined') return 'server';
  
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

/**
 * Generate a UUID v4
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── API Request Headers ─────────────────────────────────────────────
export const getAnalyticsHeaders = () => {
  return {
    'x-user-id': getUserId(),
  };
};

// ── Page View Tracking ──────────────────────────────────────────────
let lastTrackedPage = null;

/**
 * Track a frontend page view.
 */
export const trackPageView = (pagePath) => {
  if (pagePath === lastTrackedPage) return;
  lastTrackedPage = pagePath;

  const payload = {
    userId: getUserId(),
    page: pagePath,
    timestamp: new Date().toISOString(),
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  const trackUrl = `${API_URL}/api/analytics/pageview`;
  
  // Debug log for production (visible in browser console)
  console.log(`[Analytics] Tracking pageview: ${pagePath} to ${trackUrl}`);

  fetch(trackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getUserId(),
    },
    body: JSON.stringify(payload),
  }).then(res => {
    if (!res.ok) console.warn(`[Analytics] Pageview tracking failed with status: ${res.status}`);
  }).catch((err) => {
    console.warn('[Analytics] Pageview tracking failed:', err.message);
  });
};

// ── Custom Event Tracking ──────────────────────────────────────────
/**
 * Track a custom user event (e.g. click, download, share).
 */
export const trackEvent = (eventName, eventData = {}) => {
  const payload = {
    userId: getUserId(),
    eventName,
    eventData,
    page: typeof window !== 'undefined' ? window.location.pathname : null,
    timestamp: new Date().toISOString(),
  };

  const trackUrl = `${API_URL}/api/analytics/event`;
  console.log(`[Analytics] Tracking event: ${eventName}`, eventData);

  fetch(trackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getUserId(),
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn('[Analytics] Event tracking failed:', err.message);
  });
};

// ── Global Fetch Interceptor ────────────────────────────────────────
const installFetchInterceptor = () => {
  if (typeof window === 'undefined') return;
  
  const originalFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    const urlStr = typeof url === 'string' ? url : url?.url || '';
    
    // Inject header for requests to our API
    // We check for API_URL or relative /api calls
    const isOurApi = (API_URL && urlStr.startsWith(API_URL)) || urlStr.startsWith('/api') || urlStr.includes('/api/');
    
    if (isOurApi) {
      options.headers = options.headers || {};
      const uid = getUserId();
      
      if (options.headers instanceof Headers) {
        if (!options.headers.has('x-user-id')) {
          options.headers.set('x-user-id', uid);
        }
      } else {
        if (!options.headers['x-user-id']) {
          options.headers['x-user-id'] = uid;
        }
      }
    }

    return originalFetch.call(this, url, options);
  };
};

// Install
installFetchInterceptor();

export default {
  getUserId,
  getAnalyticsHeaders,
  trackPageView,
  trackEvent
};



