/**
 * Watchlist Repository Interface — the port the application layer depends on.
 * Any storage technology (Postgres, in-memory, localStorage, ...) implements this.
 */

import { WatchlistItem } from '../entities/WatchlistItem'
import { WatchlistItemId } from '../value-objects/WatchlistItemId'
import { TargetCik } from '../value-objects/TargetCik'
import { WatchlistType } from '../../../types/enums'

export interface IWatchlistRepository {
  findById(id: WatchlistItemId): Promise<WatchlistItem | null>

  findByUserId(userId: string): Promise<WatchlistItem[]>

  findByUserAndTarget(
    userId: string,
    watchType: WatchlistType,
    targetCik: TargetCik
  ): Promise<WatchlistItem | null>

  countByUserId(userId: string): Promise<number>

  save(item: WatchlistItem): Promise<WatchlistItem>

  update(item: WatchlistItem): Promise<WatchlistItem>

  delete(id: WatchlistItemId, userId: string): Promise<void>

  exists(userId: string, watchType: WatchlistType, targetCik: TargetCik): Promise<boolean>
}
