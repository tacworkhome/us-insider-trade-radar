/**
 * Get Watchlist Use Case
 */

import { IWatchlistRepository } from '../../../domain/watchlist'
import { WatchlistItemMapper } from '../mappers/WatchlistItemMapper'
import { WatchlistListResultDTO } from '../dtos/WatchlistItemDTO'
import { WatchlistLimitService } from '../services/WatchlistLimitService'

export class GetWatchlistUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly watchlistLimitService: WatchlistLimitService
  ) {}

  async execute(userId: string): Promise<WatchlistListResultDTO> {
    const items = await this.watchlistRepository.findByUserId(userId)
    const usage = await this.watchlistLimitService.getWatchlistUsage(userId)

    return {
      items: WatchlistItemMapper.toDTOs(items),
      total: usage.current,
      current: usage.current,
      limit: usage.limit,
    }
  }
}
