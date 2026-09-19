/**
 * useWatchlist — mobile presentation-layer entry point for the watchlist
 * slice.
 *
 * This is intentionally a thin wrapper: the real ViewModel logic
 * (state, use-case orchestration, error mapping) already lives in
 * `packages/shared/presentation/watchlist/useWatchlistViewModel`, which is
 * framework-agnostic React (hooks only, no DOM/RN APIs) and therefore
 * usable as-is from both apps/web and apps/mobile.
 *
 * UI (RN screen) -> ViewModel (this hook -> shared useWatchlistViewModel)
 *   -> Application (use cases, injected via the shared container)
 *     -> Domain (WatchlistItem, value objects)
 *       -> Infrastructure (InMemoryWatchlistRepository)
 *
 * Swapping infrastructure for a real Supabase-backed repository would only
 * touch `getDefaultWatchlistContainer()` in packages/shared — this hook,
 * and every screen that calls it, stays unchanged.
 */
import { useWatchlistViewModel } from '@radar/shared/presentation/watchlist'
import type { UseWatchlistViewModel } from '@radar/shared/presentation/watchlist'
import { DEMO_USER_ID } from '../../lib/demo-user'

export function useWatchlist(): UseWatchlistViewModel {
  return useWatchlistViewModel(DEMO_USER_ID)
}
