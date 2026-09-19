/**
 * Composition root for the watchlist slice.
 *
 * In production this wires a Supabase-backed repository. Here it wires the
 * in-memory one — same interfaces, so the application layer and UI never
 * know the difference. Exported as a lazily-created singleton so all
 * components in one browser tab share the same in-memory "database".
 */
import { InMemoryWatchlistRepository } from '../../../infrastructure/watchlist'
import { AddToWatchlistUseCase } from '../../../application/watchlist/use-cases/AddToWatchlistUseCase'
import { GetWatchlistUseCase } from '../../../application/watchlist/use-cases/GetWatchlistUseCase'
import { RemoveFromWatchlistUseCase } from '../../../application/watchlist/use-cases/RemoveFromWatchlistUseCase'
import { WatchlistLimitService } from '../../../application/watchlist/services/WatchlistLimitService'

export interface WatchlistContainer {
  addToWatchlist: AddToWatchlistUseCase
  getWatchlist: GetWatchlistUseCase
  removeFromWatchlist: RemoveFromWatchlistUseCase
}

const DEMO_WATCHLIST_LIMIT = 10

export function createWatchlistContainer(
  repository = new InMemoryWatchlistRepository()
): WatchlistContainer {
  const limitService = new WatchlistLimitService(repository, DEMO_WATCHLIST_LIMIT)
  return {
    addToWatchlist: new AddToWatchlistUseCase(repository, limitService),
    getWatchlist: new GetWatchlistUseCase(repository, limitService),
    removeFromWatchlist: new RemoveFromWatchlistUseCase(repository),
  }
}

let singleton: WatchlistContainer | null = null

/** Shared browser-tab-lifetime container used by the default hook export. */
export function getDefaultWatchlistContainer(): WatchlistContainer {
  if (!singleton) singleton = createWatchlistContainer()
  return singleton
}
