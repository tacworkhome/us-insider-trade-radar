import { describe, it, expect } from 'vitest'
import { WatchlistItem } from './WatchlistItem'
import { WatchlistItemId } from '../value-objects/WatchlistItemId'
import { TargetCik } from '../value-objects/TargetCik'
import { WatchlistType } from '../../../types/enums'

function makeItem(overrides: Partial<{ userId: string; watchType: WatchlistType; targetCik: string }> = {}) {
  return WatchlistItem.create({
    id: WatchlistItemId.create('item-1'),
    userId: overrides.userId ?? 'user-1',
    watchType: overrides.watchType ?? WatchlistType.Issuer,
    targetCik: TargetCik.create(overrides.targetCik ?? '320193'),
    targetName: 'Apple Inc.',
  })
}

describe('WatchlistItem', () => {
  it('creates a new item with timestamps', () => {
    const item = makeItem()
    expect(item.targetName).toBe('Apple Inc.')
    expect(item.createdAt).toBeInstanceOf(Date)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })

  it('reconstitutes from persisted props', () => {
    const props = {
      id: WatchlistItemId.create('item-2'),
      userId: 'user-1',
      watchType: WatchlistType.Owner,
      targetCik: TargetCik.create('1234567'),
      targetName: 'Jane Insider',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    }
    const item = WatchlistItem.reconstitute(props)
    expect(item.id.getValue()).toBe('item-2')
    expect(item.createdAt).toEqual(new Date('2026-01-01'))
  })

  it('updates target name and bumps updatedAt', () => {
    const item = makeItem()
    const before = item.updatedAt
    item.updateTargetName('Apple Inc. (renamed)')
    expect(item.targetName).toBe('Apple Inc. (renamed)')
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('rejects an empty target name update', () => {
    const item = makeItem()
    expect(() => item.updateTargetName('')).toThrow('Target name cannot be empty')
    expect(() => item.updateTargetName('   ')).toThrow('Target name cannot be empty')
  })

  it('checks ownership', () => {
    const item = makeItem({ userId: 'user-1' })
    expect(item.belongsToUser('user-1')).toBe(true)
    expect(item.belongsToUser('user-2')).toBe(false)
  })

  it('distinguishes issuer vs owner watch type', () => {
    const issuerItem = makeItem({ watchType: WatchlistType.Issuer })
    const ownerItem = makeItem({ watchType: WatchlistType.Owner })
    expect(issuerItem.isWatchingIssuer()).toBe(true)
    expect(issuerItem.isWatchingOwner()).toBe(false)
    expect(ownerItem.isWatchingOwner()).toBe(true)
    expect(ownerItem.isWatchingIssuer()).toBe(false)
  })

  it('matches the watched target by CIK', () => {
    const item = makeItem({ targetCik: '320193' })
    expect(item.isWatchingTarget(TargetCik.create('320193'))).toBe(true)
    expect(item.isWatchingTarget(TargetCik.create('789019'))).toBe(false)
  })
})
