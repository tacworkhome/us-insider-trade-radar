/**
 * In-memory implementation of IWatchlistRepository.
 *
 * In the production system this port is implemented by a Supabase-backed
 * repository that calls RPC functions. This demo has no database, so the
 * same interface is satisfied by a plain in-memory Map — the application
 * layer (use cases) is completely unaware of the difference.
 */
import {
  IWatchlistRepository,
  WatchlistItem,
  WatchlistItemId,
  TargetCik,
} from '../../../domain/watchlist'
import { WatchlistType } from '../../../types/enums'

export class InMemoryWatchlistRepository implements IWatchlistRepository {
  private items = new Map<string, WatchlistItem>()

  /** Test/demo helper to seed initial state. */
  seed(items: WatchlistItem[]): void {
    for (const item of items) {
      this.items.set(item.id.getValue(), item)
    }
  }

  async findById(id: WatchlistItemId): Promise<WatchlistItem | null> {
    return this.items.get(id.getValue()) ?? null
  }

  async findByUserId(userId: string): Promise<WatchlistItem[]> {
    return [...this.items.values()]
      .filter((item) => item.belongsToUser(userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findByUserAndTarget(
    userId: string,
    watchType: WatchlistType,
    targetCik: TargetCik
  ): Promise<WatchlistItem | null> {
    return (
      [...this.items.values()].find(
        (item) =>
          item.belongsToUser(userId) &&
          item.watchType === watchType &&
          item.isWatchingTarget(targetCik)
      ) ?? null
    )
  }

  async countByUserId(userId: string): Promise<number> {
    return [...this.items.values()].filter((item) => item.belongsToUser(userId)).length
  }

  async save(item: WatchlistItem): Promise<WatchlistItem> {
    this.items.set(item.id.getValue(), item)
    return item
  }

  async update(item: WatchlistItem): Promise<WatchlistItem> {
    this.items.set(item.id.getValue(), item)
    return item
  }

  async delete(id: WatchlistItemId, userId: string): Promise<void> {
    const item = this.items.get(id.getValue())
    if (item && item.belongsToUser(userId)) {
      this.items.delete(id.getValue())
    }
  }

  async exists(userId: string, watchType: WatchlistType, targetCik: TargetCik): Promise<boolean> {
    return (await this.findByUserAndTarget(userId, watchType, targetCik)) !== null
  }
}
