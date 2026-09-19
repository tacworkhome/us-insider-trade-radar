/**
 * Remove From Watchlist Use Case
 */

import {
  IWatchlistRepository,
  WatchlistItemId,
  WatchlistItemNotFoundError,
  UnauthorizedWatchlistAccessError,
} from '../../../domain/watchlist'

export class RemoveFromWatchlistUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {}

  async execute(userId: string, itemId: string): Promise<void> {
    const id = WatchlistItemId.create(itemId)

    const item = await this.watchlistRepository.findById(id)

    if (!item) {
      throw new WatchlistItemNotFoundError(itemId)
    }

    if (!item.belongsToUser(userId)) {
      throw new UnauthorizedWatchlistAccessError()
    }

    await this.watchlistRepository.delete(id, userId)
  }
}
