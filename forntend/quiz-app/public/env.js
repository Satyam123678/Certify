(function (window) {
  // Runtime environment overrides. Modify this file on the server to change values
  // without rebuilding the app. Example replacement by server:
  // window.__env = { API_BASE: 'https://api.example.com' };

  window.__env = window.__env || {};

  // Default values (can be overridden by server-side deployment)
  if (typeof window.__env.API_BASE === 'undefined') {
    // leave undefined so `src/app/config.ts` falls back to environment or localhost
    // or you can set a default here, e.g.: window.__env.API_BASE = 'https://api.example.com';
  }
})(this);
