/**
 * WatchlistItem Mapper — Domain <-> DTO
 */

import { WatchlistItem } from '../../../domain/watchlist'
import { WatchlistItemDTO } from '../dtos/WatchlistItemDTO'

export class WatchlistItemMapper {
  static toDTO(item: WatchlistItem): WatchlistItemDTO {
    return {
      id: item.id.getValue(),
      userId: item.userId,
      watchType: item.watchType,
      targetCik: item.targetCik.getValue(),
      targetName: item.targetName,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }
  }

  static toDTOs(items: WatchlistItem[]): WatchlistItemDTO[] {
    return items.map((item) => this.toDTO(item))
  }
}
