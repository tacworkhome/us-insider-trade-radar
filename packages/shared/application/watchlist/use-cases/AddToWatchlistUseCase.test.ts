import { describe, it, expect, beforeEach } from 'vitest'
import { AddToWatchlistUseCase } from './AddToWatchlistUseCase'
import { WatchlistLimitService } from '../services/WatchlistLimitService'
import { InMemoryWatchlistRepository } from '../../../infrastructure/watchlist'
import {
  WatchlistLimitExceededError,
  WatchlistItemAlreadyExistsError,
} from '../../../domain/watchlist'
import { WatchlistType } from '../../../types/enums'

describe('AddToWatchlistUseCase', () => {
  let repo: InMemoryWatchlistRepository
  let useCase: AddToWatchlistUseCase

  beforeEach(() => {
    repo = new InMemoryWatchlistRepository()
    useCase = new AddToWatchlistUseCase(repo, new WatchlistLimitService(repo, 2))
  })

  it('adds a new item and returns it as a DTO', async () => {
    const dto = await useCase.execute('user-1', {
      watchType: 'issuer',
      targetCik: '320193',
      targetName: 'Apple Inc.',
    })

    expect(dto.targetName).toBe('Apple Inc.')
    expect(dto.watchType).toBe('issuer')
    expect(await repo.countByUserId('user-1')).toBe(1)
  })

  it('rejects duplicates for the same user/type/target', async () => {
    await useCase.execute('user-1', { watchType: 'issuer', targetCik: '320193', targetName: 'Apple Inc.' })

    await expect(
      useCase.execute('user-1', { watchType: 'issuer', targetCik: '320193', targetName: 'Apple Inc.' })
    ).rejects.toThrow(WatchlistItemAlreadyExistsError)
  })

  it('enforces the plan limit', async () => {
    await useCase.execute('user-1', { watchType: 'issuer', targetCik: '1', targetName: 'A' })
    await useCase.execute('user-1', { watchType: 'issuer', targetCik: '2', targetName: 'B' })

    await expect(
      useCase.execute('user-1', { watchType: 'issuer', targetCik: '3', targetName: 'C' })
    ).rejects.toThrow(WatchlistLimitExceededError)
  })

  it('rejects an invalid watch type', async () => {
    await expect(
      useCase.execute('user-1', { watchType: 'bogus' as never, targetCik: '320193', targetName: 'Apple Inc.' })
    ).rejects.toThrow(/Invalid watch type/)
  })
})
