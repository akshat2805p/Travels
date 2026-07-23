// Centralized API Configuration for Jai Kashi Tours
(function() {
  function getApiBaseUrl() {
    // 1. Custom URL set in localStorage (e.g. from mobile app settings)
    const customUrl = localStorage.getItem('CUSTOM_API_BASE_URL');
    if (customUrl && customUrl.trim() !== '') {
      return customUrl.replace(/\/$/, '');
    }

    const host = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;

    // 2. Local Node.js server development (e.g. running node server.js on port 5500)
    if ((host === 'localhost' || host === '127.0.0.1') && port === '5500') {
      return 'http://localhost:5500';
    }

    // 3. Mobile WebView / Capacitor / Cordova environment
    const isMobileWebview = protocol === 'file:' || 
                            protocol === 'capacitor:' || 
                            (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
                            ((host === 'localhost' || host === '127.0.0.1') && port !== '5500' && port !== '3000');

    if (isMobileWebview) {
      // Return configured production API URL or fallback
      return window.DEFAULT_API_URL || window.location.origin;
    }

    // 4. Web browser / Vercel deployment (use relative paths so requests hit current domain's /api)
    return '';
  }

  window.getApiUrl = function(endpoint) {
    const base = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
  };

  window.setCustomApiBaseUrl = function(url) {
    if (url) {
      localStorage.setItem('CUSTOM_API_BASE_URL', url);
    } else {
      localStorage.removeItem('CUSTOM_API_BASE_URL');
    }
  };
})();
