/**
 * This demo has no authentication layer. Every session acts as the same
 * fixed "demo-user" id against the in-memory watchlist repository, which
 * lives for the lifetime of the app process (module-level singleton) —
 * same convention as apps/web/src/lib/demo-user.ts.
 */
export const DEMO_USER_ID = 'demo-user'
