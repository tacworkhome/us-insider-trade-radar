/**
 * useWatchlistViewModel — ViewModel hook for the watchlist feature.
 *
 * UI -> ViewModel (this hook) -> Repository (via injected use cases) -> data.
 * The container is injectable so components/tests can supply a fresh
 * in-memory container instead of sharing the module-level singleton.
 */
import { useCallback, useEffect, useState } from 'react'
import type { WatchlistContainer } from '../container/watchlistContainer'
import { getDefaultWatchlistContainer } from '../container/watchlistContainer'
import type { CreateWatchlistItemDTO, WatchlistItemDTO } from '../../../application/watchlist/dtos/WatchlistItemDTO'
import { WatchlistLimitExceededError, WatchlistItemAlreadyExistsError } from '../../../domain/watchlist'

export interface WatchlistActionResult {
  success: boolean
  error?: string
  limitReached?: boolean
}

export interface UseWatchlistViewModel {
  items: WatchlistItemDTO[]
  current: number
  limit: number
  loading: boolean
  addToWatchlist: (input: CreateWatchlistItemDTO) => Promise<WatchlistActionResult>
  removeFromWatchlist: (itemId: string) => Promise<WatchlistActionResult>
  isInWatchlist: (watchType: 'issuer' | 'owner', targetCik: string) => boolean
  refresh: () => Promise<void>
}

export function useWatchlistViewModel(
  userId: string | null,
  container: WatchlistContainer = getDefaultWatchlistContainer()
): UseWatchlistViewModel {
  const [items, setItems] = useState<WatchlistItemDTO[]>([])
  const [current, setCurrent] = useState(0)
  const [limit, setLimit] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const result = await container.getWatchlist.execute(userId)
    setItems(result.items)
    setCurrent(result.current)
    setLimit(result.limit)
    setLoading(false)
  }, [userId, container])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addToWatchlist = useCallback(
    async (input: CreateWatchlistItemDTO): Promise<WatchlistActionResult> => {
      if (!userId) return { success: false, error: 'Not signed in' }
      try {
        await container.addToWatchlist.execute(userId, input)
        await refresh()
        return { success: true }
      } catch (err) {
        if (err instanceof WatchlistLimitExceededError) {
          return { success: false, error: err.message, limitReached: true }
        }
        if (err instanceof WatchlistItemAlreadyExistsError) {
          return { success: false, error: err.message }
        }
        return { success: false, error: err instanceof Error ? err.message : 'Failed to add item' }
      }
    },
    [userId, container, refresh]
  )

  const removeFromWatchlist = useCallback(
    async (itemId: string): Promise<WatchlistActionResult> => {
      if (!userId) return { success: false, error: 'Not signed in' }
      try {
        await container.removeFromWatchlist.execute(userId, itemId)
        await refresh()
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to remove item' }
      }
    },
    [userId, container, refresh]
  )

  const isInWatchlist = useCallback(
    (watchType: 'issuer' | 'owner', targetCik: string) =>
      items.some((item) => item.watchType === watchType && item.targetCik === targetCik),
    [items]
  )

  return { items, current, limit, loading, addToWatchlist, removeFromWatchlist, isInWatchlist, refresh }
}
