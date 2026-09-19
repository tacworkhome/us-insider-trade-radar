import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryWatchlistRepository } from './InMemoryWatchlistRepository'
import { WatchlistItem, WatchlistItemId, TargetCik } from '../../../domain/watchlist'
import { WatchlistType } from '../../../types/enums'

function makeItem(id: string, userId: string, cik: string) {
  return WatchlistItem.create({
    id: WatchlistItemId.create(id),
    userId,
    watchType: WatchlistType.Issuer,
    targetCik: TargetCik.create(cik),
    targetName: 'Apple Inc.',
  })
}

describe('InMemoryWatchlistRepository', () => {
  let repo: InMemoryWatchlistRepository

  beforeEach(() => {
    repo = new InMemoryWatchlistRepository()
  })

  it('saves and finds an item by id', async () => {
    const item = makeItem('item-1', 'user-1', '320193')
    await repo.save(item)
    const found = await repo.findById(WatchlistItemId.create('item-1'))
    expect(found?.targetName).toBe('Apple Inc.')
  })

  it('returns null for an unknown id', async () => {
    const found = await repo.findById(WatchlistItemId.create('missing'))
    expect(found).toBeNull()
  })

  it('scopes findByUserId to the owning user', async () => {
    await repo.save(makeItem('item-1', 'user-1', '320193'))
    await repo.save(makeItem('item-2', 'user-2', '789019'))
    const items = await repo.findByUserId('user-1')
    expect(items).toHaveLength(1)
    expect(items[0]!.id.getValue()).toBe('item-1')
  })

  it('counts items per user', async () => {
    await repo.save(makeItem('item-1', 'user-1', '320193'))
    await repo.save(makeItem('item-2', 'user-1', '789019'))
    expect(await repo.countByUserId('user-1')).toBe(2)
    expect(await repo.countByUserId('user-2')).toBe(0)
  })

  it('checks existence by user + type + target', async () => {
    await repo.save(makeItem('item-1', 'user-1', '320193'))
    expect(
      await repo.exists('user-1', WatchlistType.Issuer, TargetCik.create('320193'))
    ).toBe(true)
    expect(
      await repo.exists('user-1', WatchlistType.Issuer, TargetCik.create('999999'))
    ).toBe(false)
  })

  it('deletes only when the item belongs to the requesting user', async () => {
    await repo.save(makeItem('item-1', 'user-1', '320193'))
    await repo.delete(WatchlistItemId.create('item-1'), 'user-2')
    expect(await repo.findById(WatchlistItemId.create('item-1'))).not.toBeNull()

    await repo.delete(WatchlistItemId.create('item-1'), 'user-1')
    expect(await repo.findById(WatchlistItemId.create('item-1'))).toBeNull()
  })
})
