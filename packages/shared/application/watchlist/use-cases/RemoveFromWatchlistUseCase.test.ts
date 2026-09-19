import { describe, it, expect, beforeEach } from 'vitest'
import { RemoveFromWatchlistUseCase } from './RemoveFromWatchlistUseCase'
import { AddToWatchlistUseCase } from './AddToWatchlistUseCase'
import { WatchlistLimitService } from '../services/WatchlistLimitService'
import { InMemoryWatchlistRepository } from '../../../infrastructure/watchlist'
import {
  WatchlistItemNotFoundError,
  UnauthorizedWatchlistAccessError,
} from '../../../domain/watchlist'

describe('RemoveFromWatchlistUseCase', () => {
  let repo: InMemoryWatchlistRepository
  let addUseCase: AddToWatchlistUseCase
  let removeUseCase: RemoveFromWatchlistUseCase

  beforeEach(() => {
    repo = new InMemoryWatchlistRepository()
    addUseCase = new AddToWatchlistUseCase(repo, new WatchlistLimitService(repo, 10))
    removeUseCase = new RemoveFromWatchlistUseCase(repo)
  })

  it('removes an item owned by the user', async () => {
    const dto = await addUseCase.execute('user-1', { watchType: 'issuer', targetCik: '320193', targetName: 'Apple Inc.' })
    await removeUseCase.execute('user-1', dto.id)
    expect(await repo.countByUserId('user-1')).toBe(0)
  })

  it('throws when the item does not exist', async () => {
    await expect(removeUseCase.execute('user-1', 'missing-id')).rejects.toThrow(WatchlistItemNotFoundError)
  })

  it('throws when a different user attempts the removal', async () => {
    const dto = await addUseCase.execute('user-1', { watchType: 'issuer', targetCik: '320193', targetName: 'Apple Inc.' })
    await expect(removeUseCase.execute('user-2', dto.id)).rejects.toThrow(UnauthorizedWatchlistAccessError)
  })
})
