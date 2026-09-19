/**
 * Add To Watchlist Use Case
 */

import {
  IWatchlistRepository,
  WatchlistItem,
  WatchlistItemId,
  TargetCik,
  WatchlistLimitExceededError,
  WatchlistItemAlreadyExistsError,
} from '../../../domain/watchlist'
import { WatchlistType, isWatchlistType } from '../../../types/enums'
import { WatchlistItemMapper } from '../mappers/WatchlistItemMapper'
import { CreateWatchlistItemDTO, WatchlistItemDTO } from '../dtos/WatchlistItemDTO'
import { WatchlistLimitService } from '../services/WatchlistLimitService'

export class AddToWatchlistUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly watchlistLimitService: WatchlistLimitService
  ) {}

  async execute(userId: string, input: CreateWatchlistItemDTO): Promise<WatchlistItemDTO> {
    const usage = await this.watchlistLimitService.getWatchlistUsage(userId)

    if (usage.isAtLimit) {
      throw new WatchlistLimitExceededError(usage.current, usage.limit)
    }

    if (!isWatchlistType(input.watchType)) {
      throw new Error(`Invalid watch type: ${input.watchType}. Must be 'issuer' or 'owner'.`)
    }
    const watchType = input.watchType as WatchlistType
    const targetCik = TargetCik.create(input.targetCik)

    const exists = await this.watchlistRepository.exists(userId, watchType, targetCik)

    if (exists) {
      throw new WatchlistItemAlreadyExistsError(input.targetName)
    }

    const id = WatchlistItemId.create(crypto.randomUUID())

    const item = WatchlistItem.create({
      id,
      userId,
      watchType,
      targetCik,
      targetName: input.targetName,
    })

    const savedItem = await this.watchlistRepository.save(item)

    return WatchlistItemMapper.toDTO(savedItem)
  }
}
