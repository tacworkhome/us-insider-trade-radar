/**
 * Watchlist Limit Service
 *
 * In the production system this reads the caller's plan tier from a
 * billing RPC. This demo has no billing/auth layer, so the plan limit
 * is injected as a plain number (defaults to the "free" tier limit) and
 * the current count comes straight from the repository — same shape,
 * no external service call.
 */
import type { IWatchlistRepository } from '../../../domain/watchlist'

export interface WatchlistUsage {
  current: number
  limit: number
  remaining: number
  isAtLimit: boolean
}

const DEFAULT_FREE_TIER_LIMIT = 10

export class WatchlistLimitService {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly limit: number = DEFAULT_FREE_TIER_LIMIT
  ) {}

  async getUserWatchlistLimit(_userId: string | null): Promise<number> {
    return this.limit
  }

  async getWatchlistCount(userId: string): Promise<number> {
    return this.watchlistRepository.countByUserId(userId)
  }

  async getWatchlistUsage(userId: string): Promise<WatchlistUsage> {
    const [limit, current] = await Promise.all([
      this.getUserWatchlistLimit(userId),
      this.getWatchlistCount(userId),
    ])

    return {
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isAtLimit: current >= limit,
    }
  }

  async canAddToWatchlist(userId: string): Promise<boolean> {
    const usage = await this.getWatchlistUsage(userId)
    return !usage.isAtLimit
  }
}
