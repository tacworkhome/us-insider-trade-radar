/**
 * WatchlistItem DTOs
 */

export interface WatchlistItemDTO {
  id: string
  userId: string
  watchType: 'issuer' | 'owner'
  targetCik: string
  targetName: string
  createdAt: string
  updatedAt: string
}

export interface CreateWatchlistItemDTO {
  watchType: 'issuer' | 'owner'
  targetCik: string
  targetName: string
}

export interface WatchlistListResultDTO {
  items: WatchlistItemDTO[]
  total: number
  current: number
  limit: number
}
