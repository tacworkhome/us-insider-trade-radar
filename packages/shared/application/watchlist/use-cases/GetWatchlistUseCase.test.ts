import { describe, it, expect, beforeEach } from 'vitest'
import { GetWatchlistUseCase } from './GetWatchlistUseCase'
import { AddToWatchlistUseCase } from './AddToWatchlistUseCase'
import { WatchlistLimitService } from '../services/WatchlistLimitService'
import { InMemoryWatchlistRepository } from '../../../infrastructure/watchlist'

describe('GetWatchlistUseCase', () => {
  let repo: InMemoryWatchlistRepository
  let addUseCase: AddToWatchlistUseCase
  let getUseCase: GetWatchlistUseCase

  beforeEach(() => {
    repo = new InMemoryWatchlistRepository()
    const limitService = new WatchlistLimitService(repo, 10)
    addUseCase = new AddToWatchlistUseCase(repo, limitService)
    getUseCase = new GetWatchlistUseCase(repo, limitService)
  })

  it('returns an empty result for a user with no items', async () => {
    const result = await getUseCase.execute('user-1')
    expect(result.items).toEqual([])
    expect(result.current).toBe(0)
    expect(result.limit).toBe(10)
  })

  it('returns items and usage after adding some', async () => {
    await addUseCase.execute('user-1', { watchType: 'issuer', targetCik: '320193', targetName: 'Apple Inc.' })
    await addUseCase.execute('user-1', { watchType: 'owner', targetCik: '1234567', targetName: 'Jane Insider' })

    const result = await getUseCase.execute('user-1')
    expect(result.items).toHaveLength(2)
    expect(result.current).toBe(2)
    expect(result.total).toBe(2)
  })
})
