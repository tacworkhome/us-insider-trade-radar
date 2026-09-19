import { describe, it, expect, beforeEach } from 'vitest'
import { WatchlistLimitService } from './WatchlistLimitService'
import { InMemoryWatchlistRepository } from '../../../infrastructure/watchlist'
import { WatchlistItem, WatchlistItemId, TargetCik } from '../../../domain/watchlist'
import { WatchlistType } from '../../../types/enums'

describe('WatchlistLimitService', () => {
  let repo: InMemoryWatchlistRepository

  beforeEach(() => {
    repo = new InMemoryWatchlistRepository()
  })

  it('defaults to the free-tier limit when none is given', async () => {
    const service = new WatchlistLimitService(repo)
    expect(await service.getUserWatchlistLimit('user-1')).toBe(10)
  })

  it('reports usage from the repository count', async () => {
    await repo.save(
      WatchlistItem.create({
        id: WatchlistItemId.create('item-1'),
        userId: 'user-1',
        watchType: WatchlistType.Issuer,
        targetCik: TargetCik.create('320193'),
        targetName: 'Apple Inc.',
      })
    )

    const service = new WatchlistLimitService(repo, 5)
    const usage = await service.getWatchlistUsage('user-1')
    expect(usage).toEqual({ current: 1, limit: 5, remaining: 4, isAtLimit: false })
  })

  it('flags isAtLimit once usage reaches the limit', async () => {
    const service = new WatchlistLimitService(repo, 0)
    expect(await service.canAddToWatchlist('user-1')).toBe(false)
  })
})
