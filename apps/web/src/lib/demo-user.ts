/**
 * This demo has no authentication layer. Every visitor acts as the same
 * fixed "demo-user" id against the in-memory watchlist repository, which
 * lives for the lifetime of the browser tab (module-level singleton).
 */
export const DEMO_USER_ID = 'demo-user'
